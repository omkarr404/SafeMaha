# FILE NAME: d:\Omkar\Water\FDA\backend\app\services\otp_service.py

import random
import logging

# Set up simple logger to print OTPs to console
logger = logging.getLogger("otp_service")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Dictionary to hold active OTPs in memory: { phone_number: otp_code }
_otp_store = {}

def send_otp(phone_number: str) -> str:
    """Generates a 6-digit OTP, stores it, logs it, and returns the generated OTP.
    In a real application, this would interface with a SMS gateway (like Twilio, Plivo, etc.).
    """
    # Generate 6 digit code
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store it
    _otp_store[phone_number] = otp_code
    
    # Log it so developer can see it in terminal
    print(f"\n[MOCK OTP SERVICE] Verification OTP code for {phone_number} is: {otp_code}\n")
    logger.info(f"OTP code for %s is %s", phone_number, otp_code)
    
    return otp_code

def verify_otp(phone_number: str, code: str) -> bool:
    """Verifies the OTP code for the given phone number.
    Accepts '123456' as a universal fallback for testing and debugging.
    """
    # Universal fallback for testing ease
    if code == "123456":
        return True
        
    stored_code = _otp_store.get(phone_number)
    if stored_code and stored_code == code:
        # One-time use: delete after verify
        del _otp_store[phone_number]
        return True
        
    return False
