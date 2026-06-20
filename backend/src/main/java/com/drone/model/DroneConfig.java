package com.drone.model;

public class DroneConfig {
    private double maxAltitude;
    private double maxSpeed;
    private double batteryCapacity;
    private double consumptionRate;
    private double safeDistance;

    public DroneConfig() {}

    public DroneConfig(double maxAltitude, double maxSpeed, double batteryCapacity,
                       double consumptionRate, double safeDistance) {
        this.maxAltitude = maxAltitude;
        this.maxSpeed = maxSpeed;
        this.batteryCapacity = batteryCapacity;
        this.consumptionRate = consumptionRate;
        this.safeDistance = safeDistance;
    }

    public double getMaxAltitude() { return maxAltitude; }
    public void setMaxAltitude(double maxAltitude) { this.maxAltitude = maxAltitude; }
    public double getMaxSpeed() { return maxSpeed; }
    public void setMaxSpeed(double maxSpeed) { this.maxSpeed = maxSpeed; }
    public double getBatteryCapacity() { return batteryCapacity; }
    public void setBatteryCapacity(double batteryCapacity) { this.batteryCapacity = batteryCapacity; }
    public double getConsumptionRate() { return consumptionRate; }
    public void setConsumptionRate(double consumptionRate) { this.consumptionRate = consumptionRate; }
    public double getSafeDistance() { return safeDistance; }
    public void setSafeDistance(double safeDistance) { this.safeDistance = safeDistance; }
}
