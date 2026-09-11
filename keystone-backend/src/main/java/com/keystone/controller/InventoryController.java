package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.*;
import com.keystone.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // --- Spare Parts ---

    @GetMapping("/parts")
    public ResponseEntity<ApiResponse<List<SparePart>>> getAllSpareParts() {
        List<SparePart> list = inventoryService.getAllSpareParts();
        return ResponseEntity.ok(ApiResponse.success(list, "Spare parts retrieved successfully"));
    }

    @GetMapping("/parts/{id}")
    public ResponseEntity<ApiResponse<SparePart>> getSparePartById(@PathVariable @NonNull Long id) {
        SparePart part = inventoryService.getSparePartById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(part, "Spare part retrieved successfully"));
    }

    @PostMapping("/parts")
    public ResponseEntity<ApiResponse<SparePart>> createSparePart(@Valid @RequestBody SparePartRequest request) {
        SparePart part = inventoryService.createSparePart(request);
        return ResponseEntity.ok(ApiResponse.success(part, "Spare part created successfully"));
    }

    @PutMapping("/parts/{id}")
    public ResponseEntity<ApiResponse<SparePart>> updateSparePart(@PathVariable @NonNull Long id, @Valid @RequestBody SparePartRequest request) {
        SparePart part = inventoryService.updateSparePart(id, request);
        return ResponseEntity.ok(ApiResponse.success(part, "Spare part updated successfully"));
    }

    @DeleteMapping("/parts/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSparePart(@PathVariable @NonNull Long id) {
        inventoryService.deleteSparePart(id);
        return ResponseEntity.ok(ApiResponse.success("Spare part deleted successfully", "Deletion successful"));
    }

    // --- Warehouses ---

    @GetMapping("/warehouses")
    public ResponseEntity<ApiResponse<List<Warehouse>>> getAllWarehouses() {
        List<Warehouse> list = inventoryService.getAllWarehouses();
        return ResponseEntity.ok(ApiResponse.success(list, "Warehouses retrieved successfully"));
    }

    @GetMapping("/warehouses/{id}")
    public ResponseEntity<ApiResponse<Warehouse>> getWarehouseById(@PathVariable @NonNull Long id) {
        Warehouse warehouse = inventoryService.getWarehouseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(warehouse, "Warehouse retrieved successfully"));
    }

    @PostMapping("/warehouses")
    public ResponseEntity<ApiResponse<Warehouse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        Warehouse warehouse = inventoryService.createWarehouse(request);
        return ResponseEntity.ok(ApiResponse.success(warehouse, "Warehouse created successfully"));
    }

    @PutMapping("/warehouses/{id}")
    public ResponseEntity<ApiResponse<Warehouse>> updateWarehouse(@PathVariable @NonNull Long id, @Valid @RequestBody WarehouseRequest request) {
        Warehouse warehouse = inventoryService.updateWarehouse(id, request);
        return ResponseEntity.ok(ApiResponse.success(warehouse, "Warehouse updated successfully"));
    }

    @DeleteMapping("/warehouses/{id}")
    public ResponseEntity<ApiResponse<String>> deleteWarehouse(@PathVariable @NonNull Long id) {
        inventoryService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deleted successfully", "Deletion successful"));
    }

    // --- Stocks ---

    @GetMapping("/warehouses/{id}/stocks")
    public ResponseEntity<ApiResponse<List<InventoryStock>>> getStocksByWarehouse(@PathVariable @NonNull Long id) {
        List<InventoryStock> list = inventoryService.getStocksByWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success(list, "Warehouse stocks retrieved successfully"));
    }

    @PostMapping("/stocks")
    public ResponseEntity<ApiResponse<InventoryStock>> updateStockQuantity(@Valid @RequestBody InventoryStockRequest request) {
        InventoryStock stock = inventoryService.updateStockQuantity(request);
        return ResponseEntity.ok(ApiResponse.success(stock, "Stock quantity updated successfully"));
    }

    // --- Purchase Orders ---

    @GetMapping("/purchase-orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllPurchaseOrders() {
        List<PurchaseOrder> list = inventoryService.getAllPurchaseOrders();
        return ResponseEntity.ok(ApiResponse.success(list, "Purchase orders retrieved successfully"));
    }

    @GetMapping("/purchase-orders/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getPurchaseOrderById(@PathVariable @NonNull Long id) {
        PurchaseOrder order = inventoryService.getPurchaseOrderById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(order, "Purchase order retrieved successfully"));
    }

    @GetMapping("/purchase-orders/{id}/items")
    public ResponseEntity<ApiResponse<List<PurchaseOrderItem>>> getPurchaseOrderItems(@PathVariable @NonNull Long id) {
        List<PurchaseOrderItem> list = inventoryService.getPurchaseOrderItems(id);
        return ResponseEntity.ok(ApiResponse.success(list, "Purchase order items retrieved successfully"));
    }

    @PostMapping("/purchase-orders")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrder order = inventoryService.createPurchaseOrder(request);
        return ResponseEntity.ok(ApiResponse.success(order, "Purchase order created successfully"));
    }

    @PutMapping("/purchase-orders/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updateOrderStatus(@PathVariable @NonNull Long id, @RequestParam String status) {
        PurchaseOrder order = inventoryService.updatePurchaseOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Purchase order status updated successfully"));
    }
}
