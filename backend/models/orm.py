from sqlalchemy import Column, Integer, String, Date, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_number = Column(String, unique=True, index=True)
    date_created = Column(Date, default=datetime.date.today)
    full_name = Column(String, index=True)
    address = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)

    chief_complaint = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)
    ocular_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)

    visual_acuity_od = Column(String, nullable=True)
    visual_acuity_os = Column(String, nullable=True)
    bcva_od = Column(String, nullable=True)
    bcva_os = Column(String, nullable=True)

    iop = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    other_tests = Column(Text, nullable=True)
    
class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_number = Column(String, unique=True, index=True)
    patient_number = Column(String, index=True)
    date = Column(Date, default=datetime.date.today)
    
    od_sphere = Column(String, nullable=True)
    od_cylinder = Column(String, nullable=True)
    od_axis = Column(String, nullable=True)
    od_add = Column(String, nullable=True)
    od_pd = Column(String, nullable=True)
    
    os_sphere = Column(String, nullable=True)
    os_cylinder = Column(String, nullable=True)
    os_axis = Column(String, nullable=True)
    os_add = Column(String, nullable=True)
    os_pd = Column(String, nullable=True)
    
    lens_type = Column(String, nullable=True)
    frame_brand = Column(String, nullable=True)
    frame_model = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String, unique=True, index=True)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    category = Column(String, nullable=True)
    quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=5)
    cost = Column(Float, nullable=True)
    selling_price = Column(Float, nullable=True)
    supplier = Column(String, nullable=True)

class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    patient_number = Column(String, index=True)
    date = Column(Date, default=datetime.date.today)
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    amount_paid = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    payment_method = Column(String, nullable=True)
    status = Column(String, nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_number = Column(String, unique=True, index=True)
    patient_number = Column(String, index=True)
    date_time = Column(DateTime)
    optometrist = Column(String, nullable=True)
    status = Column(String, nullable=True) # Scheduled, Confirmed, Checked In, Completed, Cancelled, No Show
    notes = Column(Text, nullable=True)

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=datetime.date.today)
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    payment_method = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
