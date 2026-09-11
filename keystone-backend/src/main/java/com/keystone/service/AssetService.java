package com.keystone.service;

import com.keystone.dto.AssetRequest;
import com.keystone.dto.ResourceNotFoundException;
import com.keystone.entity.Asset;
import com.keystone.entity.Building;
import com.keystone.entity.CustomerProfile;
import com.keystone.repository.AssetRepository;
import com.keystone.repository.BuildingRepository;
import com.keystone.repository.CustomerProfileRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Optional<Asset> getAssetById(@NonNull Long id) {
        return assetRepository.findById(id);
    }

    public List<Asset> getAssetsByCustomer(@NonNull Long customerId) {
        CustomerProfile customer = customerProfileRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + customerId));
        return assetRepository.findByCustomerProfile(customer);
    }

    @Transactional
    public Asset createAsset(AssetRequest request) {
        CustomerProfile customer = customerProfileRepository.findById(Objects.requireNonNull(request.getCustomerProfileId()))
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));

        Building building = null;
        if (request.getBuildingId() != null) {
            building = buildingRepository.findById(Objects.requireNonNull(request.getBuildingId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Building not found: " + request.getBuildingId()));
        }

        Asset asset = new Asset();
        asset.setName(request.getName());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setModel(request.getModel());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setWarrantyExpiration(request.getWarrantyExpiration());
        asset.setCustomerProfile(customer);
        asset.setBuilding(building);
        asset.setMaintenanceHistory(request.getMaintenanceHistory() != null ? request.getMaintenanceHistory() : "");
        asset.setQrCodeData("KEYSTONE-ASSET:" + request.getSerialNumber());

        return assetRepository.save(asset);
    }

    @Transactional
    public Asset updateAsset(@NonNull Long id, AssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));

        CustomerProfile customer = customerProfileRepository.findById(Objects.requireNonNull(request.getCustomerProfileId()))
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));

        Building building = null;
        if (request.getBuildingId() != null) {
            building = buildingRepository.findById(Objects.requireNonNull(request.getBuildingId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Building not found: " + request.getBuildingId()));
        }

        asset.setName(request.getName());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setModel(request.getModel());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setWarrantyExpiration(request.getWarrantyExpiration());
        asset.setCustomerProfile(customer);
        asset.setBuilding(building);
        if (request.getMaintenanceHistory() != null) {
            asset.setMaintenanceHistory(request.getMaintenanceHistory());
        }

        return assetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(@NonNull Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        assetRepository.delete(Objects.requireNonNull(asset));
    }

    public byte[] generateQrCodeImage(@NonNull Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        try {
            String text = "KEYSTONE-ASSET-ID:" + asset.getId() + "\nSN:" + asset.getSerialNumber() + "\nModel:" + asset.getModel();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR code for asset: " + id, e);
        }
    }
}
