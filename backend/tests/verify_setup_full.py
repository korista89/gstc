import sys
import os
import time
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.services.sheets import sheets_service

def verify_setup_robustness():
    print("=== GSTC Setup Robustness Verification ===")
    
    # 1. Test case-insensitive role matching with whitespace
    test_role = "  Admin_Test_Role  "
    subjects = ["Subject A", "Subject B"]
    
    print(f"\n1. Testing save_user_subjects for '{test_role}'...")
    success = sheets_service.save_user_subjects(test_role, subjects)
    print(f"   Save Result: {success}")
    
    if success:
        print(f"2. Testing retrieval for 'admin_test_role' (lowercase)...")
        retrieved = sheets_service.get_user_subjects("admin_test_role")
        print(f"   Retrieved: {retrieved}")
        
        if sorted(retrieved) == sorted(subjects):
            print("   PASS: Case-insensitive retrieval works.")
        else:
            print(f"   FAIL: Retrieval mismatch. Expected {subjects}, got {retrieved}")

    # 2. Test updating existing role
    new_subjects = ["Subject A", "Subject C"]
    print(f"\n3. Updating subjects for '{test_role}' to {new_subjects}...")
    success = sheets_service.save_user_subjects(test_role, new_subjects)
    print(f"   Update Result: {success}")
    
    if success:
        retrieved = sheets_service.get_user_subjects(test_role)
        print(f"   Final Retrieved: {retrieved}")
        if sorted(retrieved) == sorted(new_subjects):
            print("   PASS: Update works.")
        else:
            print("   FAIL: Update mismatch.")

if __name__ == "__main__":
    verify_setup_robustness()
