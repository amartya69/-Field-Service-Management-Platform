package com.keystone.repository;

import com.keystone.entity.InventoryStock;
import com.keystone.entity.SparePart;
import com.keystone.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
    List<InventoryStock> findByWarehouse(Warehouse warehouse);
    List<InventoryStock> findBySparePart(SparePart sparePart);
    Optional<InventoryStock> findBySparePartAndWarehouse(SparePart sparePart, Warehouse warehouse);
}
