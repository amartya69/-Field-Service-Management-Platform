package com.keystone.service;

import com.keystone.dto.TechnicianPerformanceDTO;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ReportService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private TechnicianService technicianService;

    public byte[] generateDashboardCsvReport() {
        List<WorkOrder> orders = workOrderRepository.findAll();
        long totalOrders = orders.size();
        long openOrders = orders.stream().filter(o -> o.getStatus() == WorkOrderStatus.OPEN).count();
        long progressOrders = orders.stream().filter(o -> o.getStatus() == WorkOrderStatus.IN_PROGRESS).count();
        long completedOrders = orders.stream().filter(o -> o.getStatus() == WorkOrderStatus.COMPLETED).count();
        long cancelledOrders = orders.stream().filter(o -> o.getStatus() == WorkOrderStatus.CANCELLED).count();

        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");
        csv.append("Total Work Orders,").append(totalOrders).append("\n");
        csv.append("Open Work Orders,").append(openOrders).append("\n");
        csv.append("In Progress Work Orders,").append(progressOrders).append("\n");
        csv.append("Completed Work Orders,").append(completedOrders).append("\n");
        csv.append("Cancelled Work Orders,").append(cancelledOrders).append("\n");
        csv.append("Total Registered Customers,").append(customerProfileRepository.count()).append("\n");
        csv.append("Total Assets Tracked,").append(assetRepository.count()).append("\n");
        csv.append("Total Unique Spare Parts,").append(sparePartRepository.count()).append("\n");

        return csv.toString().getBytes();
    }

    public byte[] generateTechnicianCsvReport() {
        List<Technician> techs = technicianRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Technician ID,Name,Skills,Status,Rating,Completed Orders,Avg Repair Time (Min),SLA Compliance Rate (%)\n");

        for (Technician tech : techs) {
            TechnicianPerformanceDTO perf = technicianService.getPerformanceStats(Objects.requireNonNull(tech.getId()));
            csv.append(tech.getId()).append(",")
               .append("\"").append(tech.getName()).append("\",")
               .append("\"").append(tech.getSkills()).append("\",")
               .append(tech.getStatus().name()).append(",")
               .append(tech.getRating()).append(",")
               .append(perf.getCompletedWorkOrdersCount()).append(",")
               .append(String.format("%.1f", perf.getAverageCompletionTimeMinutes())).append(",")
               .append(String.format("%.1f", perf.getSlaComplianceRate())).append("\n");
        }

        return csv.toString().getBytes();
    }

    public byte[] generateCustomerCsvReport() {
        List<CustomerProfile> customers = customerProfileRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Customer ID,Company Name,Address,Status,Buildings Count,Contacts Count,Assets Tracked\n");

        for (CustomerProfile customer : customers) {
            long buildingsCount = buildingRepository.findByCustomerProfile(customer).size();
            long contactsCount = contactRepository.findByCustomerProfile(customer).size();
            long assetsCount = assetRepository.findByCustomerProfile(customer).size();

            csv.append(customer.getId()).append(",")
               .append("\"").append(customer.getCompanyName()).append("\",")
               .append("\"").append(customer.getAddress()).append("\",")
               .append(customer.getStatus()).append(",")
               .append(buildingsCount).append(",")
               .append(contactsCount).append(",")
               .append(assetsCount).append("\n");
        }

        return csv.toString().getBytes();
    }

    public byte[] generateInventoryCsvReport() {
        List<SparePart> parts = sparePartRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Part ID,Code,Name,UnitPrice,Stock Level,Reorder Point,Status\n");

        for (SparePart part : parts) {
            String status = part.getStockLevel() <= part.getReorderPoint() ? "REORDER REQUIRED" : "IN STOCK";
            csv.append(part.getId()).append(",")
               .append(part.getCode()).append(",")
               .append("\"").append(part.getName()).append("\",")
               .append(part.getUnitPrice()).append(",")
               .append(part.getStockLevel()).append(",")
               .append(part.getReorderPoint()).append(",")
               .append(status).append("\n");
        }

        return csv.toString().getBytes();
    }
}
