from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(String, primary_key=True, index=True)  # BGW-01, BGW-02, etc.
    name = Column(String, nullable=False)
    field_name = Column(String, default="Baghewala Heavy Oil Field")
    reservoir = Column(String, default="Jodhpur Sandstone")
    depth_m = Column(Float, nullable=False)
    oil_api = Column(Float, default=18.0)
    current_status = Column(String, default="ACTIVE_PRODUCTION")  # ACTIVE_PRODUCTION, CSS_INJECTION, CSS_SOAK, MAINTENANCE
    
    # Static / current operating parameters
    init_res_temp_c = Column(Float, default=38.0)
    current_res_temp_c = Column(Float, default=125.0)
    current_res_pressure_bar = Column(Float, default=28.5)
    current_viscosity_cp = Column(Float, default=145.0)
    current_production_m3d = Column(Float, default=18.4)
    water_cut = Column(Float, default=0.32)
    
    # Current CSS status
    current_cycle_number = Column(Integer, default=3)
    steam_volume_m3 = Column(Float, default=3200.0)
    steam_temp_c = Column(Float, default=235.0)
    soak_days = Column(Float, default=3.5)
    days_into_cycle = Column(Float, default=18.0)
    
    # Current SRP status
    stroke_length_m = Column(Float, default=2.8)
    spm = Column(Float, default=7.5)
    vfd_freq_hz = Column(Float, default=45.0)
    pump_depth_m = Column(Float, default=450.0)
    plunger_dia_mm = Column(Float, default=57.0)
    pump_efficiency_pct = Column(Float, default=78.5)
    peak_rod_load_kn = Column(Float, default=94.2)
    min_rod_load_kn = Column(Float, default=14.1)
    failure_risk_pct = Column(Float, default=12.4)
    energy_per_m3 = Column(Float, default=42.8)

    # Relationships
    production_history = relationship("ProductionHistory", back_populates="well", cascade="all, delete-orphan")
    css_cycles = relationship("CssCycle", back_populates="well", cascade="all, delete-orphan")
    sensor_readings = relationship("SensorReading", back_populates="well", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="well", cascade="all, delete-orphan")

class ProductionHistory(Base):
    __tablename__ = "production_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    oil_production_m3d = Column(Float, nullable=False)
    water_production_m3d = Column(Float, nullable=False)
    reservoir_temp_c = Column(Float, nullable=False)
    viscosity_cp = Column(Float, nullable=False)
    steam_injected_m3 = Column(Float, default=0.0)
    srp_spm = Column(Float, nullable=False)
    srp_efficiency_pct = Column(Float, nullable=False)
    energy_kwh_per_m3 = Column(Float, nullable=False)
    sor = Column(Float, default=0.0)

    well = relationship("Well", back_populates="production_history")

class CssCycle(Base):
    __tablename__ = "css_cycles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False)
    cycle_number = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    steam_volume_m3 = Column(Float, nullable=False)
    steam_temp_c = Column(Float, nullable=False)
    injection_pressure_bar = Column(Float, nullable=False)
    soak_days = Column(Float, nullable=False)
    cumulative_oil_m3 = Column(Float, nullable=False)
    sor = Column(Float, nullable=False)
    peak_temp_c = Column(Float, nullable=False)

    well = relationship("Well", back_populates="css_cycles")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    bhp_bar = Column(Float, nullable=False)
    bht_c = Column(Float, nullable=False)
    surface_temp_c = Column(Float, nullable=False)
    flow_rate_m3d = Column(Float, nullable=False)
    viscosity_cp = Column(Float, nullable=False)
    peak_rod_load_kn = Column(Float, nullable=False)
    min_rod_load_kn = Column(Float, nullable=False)
    motor_power_kw = Column(Float, nullable=False)

    well = relationship("Well", back_populates="sensor_readings")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String, nullable=False)  # HIGH, MEDIUM, LOW
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # EQUIPMENT, THERMAL, VISCOSITY, EFFICIENCY
    is_active = Column(Boolean, default=True)

    well = relationship("Well", back_populates="alerts")

class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    opt_type = Column(String, nullable=False)  # CSS, SRP, INTEGRATED
    initial_params = Column(Text, nullable=False)
    optimized_params = Column(Text, nullable=False)
    production_gain_pct = Column(Float, nullable=False)
    energy_savings_pct = Column(Float, nullable=False)
    sor_reduction_pct = Column(Float, nullable=False)
