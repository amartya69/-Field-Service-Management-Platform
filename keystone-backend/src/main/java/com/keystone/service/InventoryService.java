package com.keystone.service;

import com.keystone.dto.*;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryStockRepository inventoryStockRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    // --- Spare Parts ---

    public List<SparePart> getAllSpareParts() {
        return sparePartRepository.findAll();
    }

    public Optional<SparePart> getSparePartById(@NonNull Long id) {
        return sparePartRepository.findById(id);
    }

    @Transactional
    public SparePart createSparePart(SparePartRequest request) {
        if (sparePartRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Spare part code already exists: " + request.getCode());
        }
        SparePart part = new SparePart(
                null,
                request.getName(),
                request.getCode(),
                request.getDescription(),
                request.getUnitPrice(),
                request.getStockLevel(),
                request.getReorderPoint()
        );
        return sparePartRepository.save(part);
    }

    @Transactional
    public SparePart updateSparePart(@NonNull Long id, SparePartRequest request) {
        SparePart part = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));

        part.setName(request.getName());
        part.setCode(request.getCode());
        part.setDescription(request.getDescription());
        part.setUnitPrice(request.getUnitPrice());
        part.setStockLevel(request.getStockLevel());
        part.setReorderPoint(request.getReorderPoint());

        return sparePartRepository.save(part);
    }

    @Transactional
    public void deleteSparePart(@NonNull Long id) {
        SparePart part = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + id));
        sparePartRepository.delete(Objects.requireNonNull(part));
    }

    // --- Warehouses ---

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(@NonNull Long id) {
        return warehouseRepository.findById(id);
    }

    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse(
                null,
                request.getName(),
                request.getLocation()
        );
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public Warehouse updateWarehouse(@NonNull Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public void deleteWarehouse(@NonNull Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
        warehouseRepository.delete(Objects.requireNonNull(warehouse));
    }

    // --- Inventory Stocks ---

    public List<InventoryStock> getStocksByWarehouse(@NonNull Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + warehouseId));
        return inventoryStockRepository.findByWarehouse(warehouse);
    }

    @Transactional
    public InventoryStock updateStockQuantity(InventoryStockRequest request) {
        SparePart part = sparePartRepository.findById(Objects.requireNonNull(request.getSparePartId()))
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + request.getSparePartId()));

        Warehouse warehouse = warehouseRepository.findById(Objects.requireNonNull(request.getWarehouseId()))
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + request.getWarehouseId()));

        Optional<InventoryStock> stockOpt = inventoryStockRepository.findBySparePartAndWarehouse(part, warehouse);
        InventoryStock stock;
        if (stockOpt.isPresent()) {
            stock = stockOpt.get();
            stock.setQuantity(request.getQuantity());
        } else {
            stock = new InventoryStock(null, part, warehouse, request.getQuantity());
        }

        InventoryStock savedStock = inventoryStockRepository.save(stock);

        // Update overall spare part stock level count across all warehouses
        updateOverallStockLevel(part);

        return savedStock;
    }

    private void updateOverallStockLevel(SparePart part) {
        List<InventoryStock> stocks = inventoryStockRepository.findBySparePart(part);
        int totalQty = 0;
        for (InventoryStock stock : stocks) {
            if (stock != null && stock.getQuantity() != null) {
                totalQty += stock.getQuantity();
            }
        }
        part.setStockLevel(totalQty);
        sparePartRepository.save(part);
    }

    // --- Purchase Orders ---

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(@NonNull Long id) {
        return purchaseOrderRepository.findById(id);
    }

    public List<PurchaseOrderItem> getPurchaseOrderItems(@NonNull Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + orderId));
        return purchaseOrderItemRepository.findByPurchaseOrder(order);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        if (purchaseOrderRepository.findByOrderNumber(request.getOrderNumber()).isPresent()) {
            throw new BadRequestException("Purchase order number already exists: " + request.getOrderNumber());
        }

        PurchaseOrder order = new PurchaseOrder(
                null,
                request.getOrderNumber(),
                request.getVendorName(),
                "PENDING",
                LocalDateTime.now()
        );
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        for (PurchaseOrderItemDTO itemDto : request.getItems()) {
            SparePart part = sparePartRepository.findById(Objects.requireNonNull(itemDto.getSparePartId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Spare part not found: " + itemDto.getSparePartId()));

            PurchaseOrderItem item = new PurchaseOrderItem(
                    null,
                    savedOrder,
                    part,
                    itemDto.getQuantity(),
                    itemDto.getUnitPrice()
            );
            purchaseOrderItemRepository.save(item);
        }

        return savedOrder;
    }

    @Transactional
    public PurchaseOrder updatePurchaseOrderStatus(@NonNull Long id, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));

        String oldStatus = order.getStatus();
        String newStatus = status.toUpperCase();

        if (newStatus.equals(oldStatus)) {
            return order;
        }

        order.setStatus(newStatus);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);

        // If transitioning to RECEIVED, increment stock
        if (newStatus.equals("RECEIVED") && !oldStatus.equals("RECEIVED")) {
            List<PurchaseOrderItem> items = purchaseOrderItemRepository.findByPurchaseOrder(updatedOrder);
            
            // Get or create a default warehouse to dump the items
            Warehouse defaultWarehouse = warehouseRepository.findAll().stream().findFirst().orElseGet(() -> {
                Warehouse w = new Warehouse(null, "Main Central Warehouse", "HQ Building A");
                return warehouseRepository.save(w);
            });

            for (PurchaseOrderItem item : items) {
                SparePart part = item.getSparePart();
                
                // Add to warehouse inventory stock
                Optional<InventoryStock> stockOpt = inventoryStockRepository.findBySparePartAndWarehouse(part, defaultWarehouse);
                InventoryStock stock;
                if (stockOpt.isPresent()) {
                    stock = stockOpt.get();
                    stock.setQuantity(stock.getQuantity() + item.getQuantity());
                } else {
                    stock = new InventoryStock(null, part, defaultWarehouse, item.getQuantity());
                }
                inventoryStockRepository.save(stock);

                // Update spare part overall stock count
                updateOverallStockLevel(part);
            }
        }

        return updatedOrder;
    }
}
