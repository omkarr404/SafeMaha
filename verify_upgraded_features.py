import sys
import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("==================================================")
    print("  SafeMaha Upgrade Feature Verification Script")
    print("==================================================")
    
    # 1. Test backend server online
    try:
        res = requests.get(f"{BASE_URL}/")
        res.raise_for_status()
        print("[OK] Backend server is online and running.")
        print(f"    Details: {res.json()}")
    except Exception as e:
        print(f"[FAIL] Failed to connect to backend server at {BASE_URL}.")
        print("    Ensure the backend is running with 'uvicorn app.main:app --reload' in backend folder.")
        sys.exit(1)
        
    # 2. Test Admin Login
    print("\n[+] Testing admin login...")
    try:
        login_res = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@fda.gov.in",
            "password": "admin123"
        })
        login_res.raise_for_status()
        admin_token = login_res.json()["access_token"]
        print("[OK] Admin login successful.")
        print(f"    Admin User: {login_res.json()['user']['name']} ({login_res.json()['user']['role']})")
    except Exception as e:
        print(f"[FAIL] Admin login failed: {e}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Test Districts Seeding
    print("\n[+] Testing districts seeding retrieval...")
    try:
        dist_res = requests.get(f"{BASE_URL}/api/districts/")
        dist_res.raise_for_status()
        districts = dist_res.json()
        print(f"[OK] Successfully retrieved districts. Total districts: {len(districts)}")
        # Print a few samples
        sample_districts = districts[:3]
        for dist in sample_districts:
            t_res = requests.get(f"{BASE_URL}/api/districts/{dist['id']}/talukas")
            t_res.raise_for_status()
            t_list = t_res.json()
            print(f"    - District: {dist['name']} (Talukas count: {len(t_list)})")
        mumbai_city = next((d for d in districts if d['name'] == 'Mumbai City'), districts[0])
        mumbai_dist_id = mumbai_city['id']
        
        mumbai_t_res = requests.get(f"{BASE_URL}/api/districts/{mumbai_dist_id}/talukas")
        mumbai_t_res.raise_for_status()
        mumbai_talukas = mumbai_t_res.json()
        mumbai_taluka_id = mumbai_talukas[0]['id'] if mumbai_talukas else None
    except Exception as e:
        print(f"[FAIL] Districts retrieval failed: {e}")
        sys.exit(1)

    # 4. Test Officer CRUD (Create / List)
    print("\n[+] Testing Officer Management System CRUD...")
    test_officer_email = "verify.officer@fda.gov.in"
    try:
        # Check list first, clean up if verify officer exists from a prior test
        officers_list_res = requests.get(f"{BASE_URL}/api/admin/officers/", headers=headers)
        officers_list_res.raise_for_status()
        existing_officers = officers_list_res.json()
        
        for off in existing_officers:
            if off["email"] == test_officer_email:
                print(f"    Cleaning up existing test officer with ID: {off['id']}")
                requests.delete(f"{BASE_URL}/api/admin/officers/{off['id']}", headers=headers)

        # Create Officer
        create_payload = {
            "name": "Inspector Ramesh Shinde",
            "email": test_officer_email,
            "mobile": "9820123456",
            "district": "Mumbai City",
            "role": "Inspector",
            "is_active": True
        }
        create_res = requests.post(f"{BASE_URL}/api/admin/officers/", json=create_payload, headers=headers)
        create_res.raise_for_status()
        new_officer = create_res.json()
        print(f"[OK] Created new officer: {new_officer['name']} (ID: {new_officer['id']})")

        # List Officers
        list_res = requests.get(f"{BASE_URL}/api/admin/officers/", headers=headers)
        list_res.raise_for_status()
        print(f"[OK] Listed officers. Total officers: {len(list_res.json())}")
    except Exception as e:
        print(f"[FAIL] Officer management test failed: {e}")
        sys.exit(1)

    # 5. Create Complaint & Verify Auto-Priority Classification
    print("\n[+] Testing Complaint submission & automatic priority classification...")
    complaint_payload = {
        "title": "Severe Poisoning Outbreak from local bakery",
        "category": "food",
        "description": "3 children hospitalized after eating cake from the local bakery. Urgent safety hazard!",
        "name": "Citizen Rohit",
        "mobile": "9999999999",
        "district_id": mumbai_dist_id,
        "taluka_id": mumbai_taluka_id,
        "location": {
            "address": "Bandra West, Mumbai City",
            "latitude": 19.0596,
            "longitude": 72.8295
        }
    }
    
    try:
        # Submit complaint
        comp_res = requests.post(f"{BASE_URL}/api/complaints/", json=complaint_payload)
        comp_res.raise_for_status()
        complaint = comp_res.json()
        complaint_id = complaint["id"]
        print(f"[OK] Complaint submitted successfully. Reference Number: {complaint_id}")
        print(f"    Auto-Classified Priority: {complaint.get('priority')}")
        assert complaint.get('priority') == 'Critical', "Priority should have been auto-classified as Critical!"
        print("    [OK] Auto-priority assertion PASSED.")
    except Exception as e:
        print(f"[FAIL] Complaint submission test failed: {e}")
        sys.exit(1)

    # 6. Test Officer Assignment
    print("\n[+] Testing Complaint Assignment & Audit Logging...")
    try:
        assign_payload = {
            "assignedOfficer": new_officer["name"],
            "actor_email": "admin@fda.gov.in"
        }
        assign_res = requests.put(f"{BASE_URL}/api/complaints/{complaint_id}", json=assign_payload)
        assign_res.raise_for_status()
        updated_comp = assign_res.json()
        print(f"[OK] Successfully assigned complaint to {updated_comp['assignedOfficer']}.")
        
        # Verify Audit Log entry
        audit_res = requests.get(f"{BASE_URL}/api/admin/complaints/{complaint_id}/audits", headers=headers)
        audit_res.raise_for_status()
        audits = audit_res.json()
        print(f"[OK] Retrieved audit logs. Entries count: {len(audits)}")
        for audit in audits:
            print(f"    - Action: {audit['action']} by {audit['user_id']} at {audit['timestamp']}")
            
    except Exception as e:
        print(f"[FAIL] Assignment / Audit logs test failed: {e}")
        sys.exit(1)

    # 7. Test Guest Tracking Endpoint
    print("\n[+] Testing guest complaint tracking verification (OTP-free)...")
    try:
        # Fetch details
        guest_res = requests.get(f"{BASE_URL}/api/complaints/{complaint_id}")
        guest_res.raise_for_status()
        guest_data = guest_res.json()
        
        # Check fields match
        print(f"[OK] Guest successfully queried complaint {guest_data['id']}.")
        print(f"    Reported Mobile: {guest_data['mobile']}")
        print(f"    Current Status: {guest_data['status']}")
        print(f"    Assigned Officer: {guest_data['assignedOfficer']}")
        print(f"    Last Updated: {guest_data['updated_at']}")
        
        assert guest_data['mobile'] == "9999999999", "Mobile number mismatch!"
        print("    [OK] Guest mobile number matches registered mobile.")
    except Exception as e:
        print(f"[FAIL] Guest tracking test failed: {e}")
        sys.exit(1)

    # 8. Clean up test officer
    print("\n[+] Cleaning up test officer...")
    try:
        del_res = requests.delete(f"{BASE_URL}/api/admin/officers/{new_officer['id']}", headers=headers)
        del_res.raise_for_status()
        print("[OK] Cleaned up test officer successfully.")
    except Exception as e:
        print(f"[!] Warning: cleanup failed: {e}")

    print("\n==================================================")
    print("  ALL CORE UPGRADE API TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
