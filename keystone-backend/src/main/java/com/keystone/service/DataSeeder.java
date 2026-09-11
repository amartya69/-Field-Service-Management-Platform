package com.keystone.service;

import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SparePartRepository sparePartRepository;

    @Autowired
    private InventoryStockRepository inventoryStockRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SlaPolicyRepository slaPolicyRepository;

    @Autowired
    private CustomerRequestRepository customerRequestRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (workOrderRepository.count() > 0) {
            return; // DB already has work orders data
        }


        System.out.println("Seeding database with Keystone initial dataset...");

        // 1. Create Users
        User adminUser = userRepository.findByUsername("admin").orElseGet(() -> userRepository.save(new User(null, "admin", encoder.encode("admin123"), "admin@keystone.com", Role.ROLE_ADMIN)));
        User dispatcherUser = userRepository.findByUsername("dispatcher").orElseGet(() -> userRepository.save(new User(null, "dispatcher", encoder.encode("dispatch123"), "dispatcher@keystone.com", Role.ROLE_DISPATCHER)));
        
        User techUser1 = userRepository.findByUsername("marcus").orElseGet(() -> userRepository.save(new User(null, "marcus", encoder.encode("tech123"), "marcus@keystone.com", Role.ROLE_TECHNICIAN)));
        User techUser2 = userRepository.findByUsername("sarah").orElseGet(() -> userRepository.save(new User(null, "sarah", encoder.encode("tech123"), "sarah@keystone.com", Role.ROLE_TECHNICIAN)));
        User techUser3 = userRepository.findByUsername("john").orElseGet(() -> userRepository.save(new User(null, "john", encoder.encode("tech123"), "john@keystone.com", Role.ROLE_TECHNICIAN)));
        
        User customerUser1 = userRepository.findByUsername("spacex").orElseGet(() -> userRepository.save(new User(null, "spacex", encoder.encode("customer123"), "facilities@spacex.com", Role.ROLE_CUSTOMER)));
        User customerUser2 = userRepository.findByUsername("walmart").orElseGet(() -> userRepository.save(new User(null, "walmart", encoder.encode("customer123"), "operations@walmart.com", Role.ROLE_CUSTOMER)));


        // 2. Create Technicians
        Technician tech1 = technicianRepository.save(new Technician(null, techUser1, "Marcus Brody", "HVAC, Electrical, Controls", TechnicianStatus.AVAILABLE, "555-0192", 4.8));
        Technician tech2 = technicianRepository.save(new Technician(null, techUser2, "Sarah Connor", "Plumbing, Fire Safety, Hydraulics", TechnicianStatus.ON_SITE, "555-0143", 4.9));
        Technician tech3 = technicianRepository.save(new Technician(null, techUser3, "John Doe", "Elevators, Electrical, Access Systems", TechnicianStatus.AVAILABLE, "555-0177", 4.5));

        // 3. Customer Profiles, Buildings, Sites & Contacts
        CustomerProfile cust1 = customerProfileRepository.save(new CustomerProfile(null, customerUser1, "SpaceX Launch Complex HQ", "Rocket Road, Hawthorne, CA", "ACTIVE"));
        Building bldg1 = buildingRepository.save(new Building(null, cust1, "Falcon Hangar 1", "Rocket Road, Hangar 1"));
        buildingRepository.save(new Building(null, cust1, "Cleanroom Facility 3", "Rocket Road, Bldg 3"));
        siteRepository.save(new Site(null, bldg1, "Cryogenic Cooling Bay B", "Sub-floor cooling mechanical room"));
        siteRepository.save(new Site(null, bldg1, "Telemetry Control Center - Floor 2", "Mission control room"));
        contactRepository.save(new Contact(null, cust1, "Gwynne Shotwell", "President & COO", "gwynne@spacex.com", "555-0111"));

        CustomerProfile cust2 = customerProfileRepository.save(new CustomerProfile(null, customerUser2, "Walmart Fulfillment Center #402", "702 SW 8th St, Bentonville, AR", "ACTIVE"));
        Building bldg2 = buildingRepository.save(new Building(null, cust2, "Automated Distribution Hub", "702 SW 8th St, Hub A"));
        siteRepository.save(new Site(null, bldg2, "Cold Storage Freezer Bay 4", "Temperature controlled facility"));
        contactRepository.save(new Contact(null, cust2, "Doug McMillon", "Director of Logistics", "dmcmillon@walmart.com", "555-0222"));

        // 4. Assets
        Asset asset1 = assetRepository.save(new Asset(null, "Central Chiller Unit #4", "SN-994821-B", "Carrier 500-Ton Centrifugal Liquid Chiller", LocalDateTime.now().minusMonths(14), LocalDateTime.now().plusMonths(10), cust1, bldg1, "Routine inspection performed in May. Refrigerant topped up.", "ASSET-QR-HVAC-CHILL-500"));
        Asset asset2 = assetRepository.save(new Asset(null, "Back-Up Diesel Generator 500kW", "SN-CAT-88419", "Caterpillar C18 Industrial Diesel Generator Set", LocalDateTime.now().minusMonths(20), LocalDateTime.now().plusMonths(4), cust1, bldg1, "Quarterly battery replacement completed.", "ASSET-QR-PWR-GEN-500KW"));
        Asset asset3 = assetRepository.save(new Asset(null, "Automated Access Control Gate #2", "SN-BOSCH-3321", "Bosch Biometric RFID Security Gate", LocalDateTime.now().minusMonths(6), LocalDateTime.now().plusMonths(18), cust2, bldg2, "Firmware updated to v4.2.1.", "ASSET-QR-SEC-GATE-02"));
        Asset asset4 = assetRepository.save(new Asset(null, "High-Speed Passenger Elevator Shaft B", "SN-OTIS-77412", "Otis SkyRise High-Speed Elevator System", LocalDateTime.now().minusMonths(10), LocalDateTime.now().plusMonths(14), cust2, bldg2, "Cable inspection passed safety standards.", "ASSET-QR-ELEV-OTIS-B"));

        // 5. Inventory: Warehouses & Spare Parts & Stocks
        Warehouse wh1 = warehouseRepository.save(new Warehouse(null, "Central Logistics Hub", "Building 4, Sector 7 Industrial Park"));
        Warehouse wh2 = warehouseRepository.save(new Warehouse(null, "West Coast Distribution Depot", "Bay 12, Terminal Port Way"));

        SparePart part1 = sparePartRepository.save(new SparePart(null, "HEPA Filter Air-200", "PART-HEPA-200", "High-efficiency particulate air filter for commercial HVAC", 120.0, 48, 10));
        SparePart part2 = sparePartRepository.save(new SparePart(null, "Copper Pipe Joint 2-inch", "PART-COPPER-2IN", "Heavy-duty reinforced copper pipe fitting", 25.0, 120, 25));
        SparePart part3 = sparePartRepository.save(new SparePart(null, "12V 200Ah AGM Battery", "PART-BAT-12V200", "Deep-cycle AGM battery for back-up UPS systems", 350.0, 8, 5));
        SparePart part4 = sparePartRepository.save(new SparePart(null, "Digital Thermostat Controller", "PART-THERM-BAC", "Smart programmable BACnet thermostat", 210.0, 15, 8));

        inventoryStockRepository.save(new InventoryStock(null, part1, wh1, 48));
        inventoryStockRepository.save(new InventoryStock(null, part2, wh1, 120));
        inventoryStockRepository.save(new InventoryStock(null, part3, wh2, 8));
        inventoryStockRepository.save(new InventoryStock(null, part4, wh2, 15));

        // 6. Purchase Orders
        PurchaseOrder po1 = purchaseOrderRepository.save(new PurchaseOrder(null, "PO-94821", "Carrier Commercial Parts Ltd", "PENDING", LocalDateTime.now().minusDays(2)));
        PurchaseOrder po2 = purchaseOrderRepository.save(new PurchaseOrder(null, "PO-10245", "Bosch Industrial Electronics", "FULFILLED", LocalDateTime.now().minusDays(10)));
        purchaseOrderRepository.save(new PurchaseOrder(null, "PO-88392", "Caterpillar Power Systems", "APPROVED", LocalDateTime.now().minusDays(5)));

        // 7. SLA Policies
        slaPolicyRepository.save(new SlaPolicy(null, "Emergency Critical Facility SLA", WorkOrderPriority.CRITICAL, 1, 4));
        slaPolicyRepository.save(new SlaPolicy(null, "High Priority Commercial SLA", WorkOrderPriority.HIGH, 2, 8));
        slaPolicyRepository.save(new SlaPolicy(null, "Medium Priority Standard SLA", WorkOrderPriority.MEDIUM, 8, 24));
        slaPolicyRepository.save(new SlaPolicy(null, "Low Priority Routine SLA", WorkOrderPriority.LOW, 24, 72));

        // 8. Create Customer Requests
        CustomerRequest req1 = new CustomerRequest(
                null, customerUser1, "Main HVAC Fan Noise", 
                "The primary AC unit in building B is making a loud squealing noise and blowing lukewarm air.", 
                "HVAC", CustomerRequestStatus.APPROVED, LocalDateTime.now().minusDays(5)
        );
        CustomerRequest req2 = new CustomerRequest(
                null, customerUser2, "Server Room Power Outage", 
                "Backup generator didn't kick in, row 3 UPS reporting low battery. Immediate dispatcher required.", 
                "Electrical", CustomerRequestStatus.APPROVED, LocalDateTime.now().minusDays(3)
        );
        CustomerRequest req3 = new CustomerRequest(
                null, customerUser1, "Leaking Restroom Sink", 
                "Water is pooling under the double sink in the 3rd-floor executive restroom.", 
                "Plumbing", CustomerRequestStatus.PENDING, LocalDateTime.now().minusHours(4)
        );
        CustomerRequest req4 = new CustomerRequest(
                null, customerUser2, "Front Lobby Glass Door Alignment", 
                "The double sliding entrance door is getting stuck halfway open, causing draft in lobby.", 
                "Other", CustomerRequestStatus.PENDING, LocalDateTime.now().minusHours(1)
        );

        customerRequestRepository.save(req1);
        customerRequestRepository.save(req2);
        customerRequestRepository.save(req3);
        customerRequestRepository.save(req4);

        // 9. Create Work Orders
        WorkOrder wo1 = new WorkOrder(
                null, "HVAC Belt Replacement & Recharge", 
                "Replace cracked fan belt on Roof Unit 4 and recharge coolant. Originating from Building B noise complaint.", 
                WorkOrderPriority.HIGH, WorkOrderStatus.IN_PROGRESS, tech2, req1, 
                "Building B - Roof Access", LocalDateTime.now().minusDays(1), null, 
                "V-Belt Size 42, R-410A Refrigerant 5lbs", 0, LocalDateTime.now().minusDays(5)
        );

        WorkOrder wo2 = new WorkOrder(
                null, "UPS Fuse Swap & Generator Sync Test", 
                "Replace blown 100A fuses on the main server rack UPS line. Trigger generator synchronization test cycle.", 
                WorkOrderPriority.CRITICAL, WorkOrderStatus.COMPLETED, tech1, req2, 
                "Building A - Server Room 101", LocalDateTime.now().minusDays(3), LocalDateTime.now().minusDays(3).plusHours(2), 
                "100A Cooper Bussmann Fuses (x3)", 120, LocalDateTime.now().minusDays(3)
        );

        WorkOrder wo3 = new WorkOrder(
                null, "Emergency Electrical Panel Diagnostic", 
                "Perform load analysis and IR thermal scan on Panel board 2B. Suspected hot breaker feeding the assembly line.", 
                WorkOrderPriority.MEDIUM, WorkOrderStatus.OPEN, tech3, null, 
                "Production Floor - Pillar G", LocalDateTime.now().plusDays(1), null, 
                "", 0, LocalDateTime.now().minusDays(2)
        );

        WorkOrder wo4 = new WorkOrder(
                null, "Fire Alarm Strobe Light Replacement", 
                "Replace broken wall-mount emergency strobe alarm light outside room 204.", 
                WorkOrderPriority.LOW, WorkOrderStatus.COMPLETED, tech3, null, 
                "Building C - 2nd Floor Corridor", LocalDateTime.now().minusDays(4), LocalDateTime.now().minusDays(4).plusHours(1), 
                "System Sensor Xenon Strobe Unit", 45, LocalDateTime.now().minusDays(4)
        );

        workOrderRepository.save(wo1);
        workOrderRepository.save(wo2);
        workOrderRepository.save(wo3);
        workOrderRepository.save(wo4);

        // 10. Create System Notifications
        notificationRepository.save(new Notification(null, adminUser, "Database initialization completed successfully.", true, LocalDateTime.now()));
        notificationRepository.save(new Notification(null, dispatcherUser, "New pending customer service request submitted.", false, LocalDateTime.now()));
        notificationRepository.save(new Notification(null, techUser1, "Assigned to Critical Work Order #1002 UPS Fuse Swap.", true, LocalDateTime.now().minusDays(3)));
        notificationRepository.save(new Notification(null, techUser2, "Assigned to High Work Order #1001 Roof HVAC Unit.", false, LocalDateTime.now().minusDays(1)));
        notificationRepository.save(new Notification(null, customerUser1, "Your Service Request 'Main HVAC Fan Noise' has been scheduled.", false, LocalDateTime.now().minusDays(5)));

        // 11. Audit Logs
        auditLogRepository.save(new AuditLog(null, "CREATE_WORK_ORDER", "WorkOrder", 1L, "admin", LocalDateTime.now().minusDays(2), "Created Work Order #1: Emergency Chiller System Inspection"));
        auditLogRepository.save(new AuditLog(null, "ASSIGN_TECHNICIAN", "WorkOrder", 1L, "dispatcher", LocalDateTime.now().minusDays(2), "Assigned Technician Marcus Brody to Work Order #1"));
        auditLogRepository.save(new AuditLog(null, "UPDATE_STATUS", "WorkOrder", 1L, "marcus", LocalDateTime.now().minusHours(3), "Updated status from OPEN to IN_PROGRESS"));
        auditLogRepository.save(new AuditLog(null, "RAISE_PURCHASE_ORDER", "PurchaseOrder", 1L, "admin", LocalDateTime.now().minusDays(2), "Raised PO-94821 for Carrier Commercial Parts Ltd"));

        System.out.println("Keystone Database seeding done.");
    }
}
