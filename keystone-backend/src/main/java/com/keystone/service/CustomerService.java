package com.keystone.service;

import com.keystone.dto.*;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private ContactRepository contactRepository;

    // --- Customer Profile ---

    public List<CustomerProfile> getAllCustomers() {
        return customerProfileRepository.findAll();
    }

    public Optional<CustomerProfile> getCustomerById(Long id) {
        return customerProfileRepository.findById(id);
    }

    public Optional<CustomerProfile> getCustomerByUserId(Long userId) {
        return userRepository.findById(userId)
                .flatMap(user -> customerProfileRepository.findByUser(user));
    }

    @Transactional
    public CustomerProfile createCustomer(CustomerProfileRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        }

        CustomerProfile profile = new CustomerProfile(
                null,
                user,
                request.getCompanyName(),
                request.getAddress(),
                request.getStatus() != null ? request.getStatus() : "ACTIVE"
        );
        return customerProfileRepository.save(profile);
    }

    @Transactional
    public CustomerProfile updateCustomer(Long id, CustomerProfileRequest request) {
        CustomerProfile profile = customerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with id: " + id));

        profile.setCompanyName(request.getCompanyName());
        profile.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            profile.setStatus(request.getStatus());
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
            profile.setUser(user);
        }

        return customerProfileRepository.save(profile);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        CustomerProfile profile = customerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with id: " + id));
        customerProfileRepository.delete(profile);
    }

    // --- Buildings ---

    public List<Building> getBuildingsByCustomer(Long customerId) {
        CustomerProfile customer = customerProfileRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with id: " + customerId));
        return buildingRepository.findByCustomerProfile(customer);
    }

    @Transactional
    public Building createBuilding(BuildingRequest request) {
        CustomerProfile customer = customerProfileRepository.findById(request.getCustomerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));

        Building building = new Building(
                null,
                customer,
                request.getName(),
                request.getAddress()
        );
        return buildingRepository.save(building);
    }

    @Transactional
    public Building updateBuilding(Long id, BuildingRequest request) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));

        building.setName(request.getName());
        building.setAddress(request.getAddress());

        if (!building.getCustomerProfile().getId().equals(request.getCustomerProfileId())) {
            CustomerProfile customer = customerProfileRepository.findById(request.getCustomerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));
            building.setCustomerProfile(customer);
        }

        return buildingRepository.save(building);
    }

    @Transactional
    public void deleteBuilding(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
        buildingRepository.delete(building);
    }

    // --- Sites ---

    public List<Site> getSitesByBuilding(Long buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + buildingId));
        return siteRepository.findByBuilding(building);
    }

    @Transactional
    public Site createSite(SiteRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + request.getBuildingId()));

        Site site = new Site(
                null,
                building,
                request.getName(),
                request.getDescription()
        );
        return siteRepository.save(site);
    }

    @Transactional
    public Site updateSite(Long id, SiteRequest request) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + id));

        site.setName(request.getName());
        site.setDescription(request.getDescription());

        if (!site.getBuilding().getId().equals(request.getBuildingId())) {
            Building building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Building not found: " + request.getBuildingId()));
            site.setBuilding(building);
        }

        return siteRepository.save(site);
    }

    @Transactional
    public void deleteSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + id));
        siteRepository.delete(site);
    }

    // --- Contacts ---

    public List<Contact> getContactsByCustomer(Long customerId) {
        CustomerProfile customer = customerProfileRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found with id: " + customerId));
        return contactRepository.findByCustomerProfile(customer);
    }

    @Transactional
    public Contact createContact(ContactRequest request) {
        CustomerProfile customer = customerProfileRepository.findById(request.getCustomerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));

        Contact contact = new Contact(
                null,
                customer,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getRole()
        );
        return contactRepository.save(contact);
    }

    @Transactional
    public Contact updateContact(Long id, ContactRequest request) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));

        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setRole(request.getRole());

        if (!contact.getCustomerProfile().getId().equals(request.getCustomerProfileId())) {
            CustomerProfile customer = customerProfileRepository.findById(request.getCustomerProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found: " + request.getCustomerProfileId()));
            contact.setCustomerProfile(customer);
        }

        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
        contactRepository.delete(contact);
    }
}
