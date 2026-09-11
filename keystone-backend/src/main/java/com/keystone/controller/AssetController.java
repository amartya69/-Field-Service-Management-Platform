package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.Asset;
import com.keystone.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAllAssets() {
        List<Asset> list = assetService.getAllAssets();
        return ResponseEntity.ok(ApiResponse.success(list, "Assets retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> getAssetById(@PathVariable @NonNull Long id) {
        Asset asset = assetService.getAssetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(asset, "Asset retrieved successfully"));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Asset>>> getAssetsByCustomer(@PathVariable @NonNull Long customerId) {
        List<Asset> list = assetService.getAssetsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(list, "Customer assets retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Asset>> createAsset(@Valid @RequestBody AssetRequest request) {
        Asset asset = assetService.createAsset(request);
        return ResponseEntity.ok(ApiResponse.success(asset, "Asset created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(@PathVariable @NonNull Long id, @Valid @RequestBody AssetRequest request) {
        Asset asset = assetService.updateAsset(id, request);
        return ResponseEntity.ok(ApiResponse.success(asset, "Asset updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAsset(@PathVariable @NonNull Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok(ApiResponse.success("Asset deleted successfully", "Deletion successful"));
    }

    @GetMapping(value = "/{id}/qrcode", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getAssetQrCode(@PathVariable @NonNull Long id) {
        byte[] qrCodeBytes = assetService.generateQrCodeImage(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(qrCodeBytes, headers, HttpStatus.OK);
    }
}
