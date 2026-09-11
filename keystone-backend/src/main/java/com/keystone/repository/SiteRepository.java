package com.keystone.repository;

import com.keystone.entity.Building;
import com.keystone.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByBuilding(Building building);
}
