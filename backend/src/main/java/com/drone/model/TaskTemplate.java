package com.drone.model;

import java.util.List;

public class TaskTemplate {
    private String id;
    private String name;
    private String description;
    private String category;
    private List<Waypoint> waypoints;
    private DroneConfig droneConfig;
    private String selectedAlgorithm;
    private double defaultAltitude;
    private double defaultSpeed;
    private long createdAt;
    private long updatedAt;

    public TaskTemplate() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<Waypoint> getWaypoints() { return waypoints; }
    public void setWaypoints(List<Waypoint> waypoints) { this.waypoints = waypoints; }
    public DroneConfig getDroneConfig() { return droneConfig; }
    public void setDroneConfig(DroneConfig droneConfig) { this.droneConfig = droneConfig; }
    public String getSelectedAlgorithm() { return selectedAlgorithm; }
    public void setSelectedAlgorithm(String selectedAlgorithm) { this.selectedAlgorithm = selectedAlgorithm; }
    public double getDefaultAltitude() { return defaultAltitude; }
    public void setDefaultAltitude(double defaultAltitude) { this.defaultAltitude = defaultAltitude; }
    public double getDefaultSpeed() { return defaultSpeed; }
    public void setDefaultSpeed(double defaultSpeed) { this.defaultSpeed = defaultSpeed; }
    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
}
