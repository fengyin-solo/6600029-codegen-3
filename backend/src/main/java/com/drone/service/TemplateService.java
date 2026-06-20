package com.drone.service;

import com.drone.model.TaskTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TemplateService {

    private final Map<String, TaskTemplate> templates = new ConcurrentHashMap<>();

    public TemplateService() {
        initSampleTemplates();
    }

    private void initSampleTemplates() {
        long now = System.currentTimeMillis();
        TaskTemplate t1 = new TaskTemplate();
        t1.setId("tpl-sample-power");
        t1.setName("标准电力线路巡检");
        t1.setDescription("适用于10kV架空线路常规巡检");
        t1.setCategory("power");
        t1.setSelectedAlgorithm("astar");
        t1.setDefaultAltitude(50);
        t1.setDefaultSpeed(8);
        t1.setCreatedAt(now);
        t1.setUpdatedAt(now);
        t1.setWaypoints(new ArrayList<>());
        t1.setDroneConfig(new com.drone.model.DroneConfig(500, 20, 5000, 100, 30));
        templates.put(t1.getId(), t1);
    }

    public List<TaskTemplate> listTemplates(String category) {
        List<TaskTemplate> result = new ArrayList<>();
        for (TaskTemplate t : templates.values()) {
            if (category == null || category.equals("all") || category.equals(t.getCategory())) {
                result.add(t);
            }
        }
        result.sort((a, b) -> Long.compare(b.getUpdatedAt(), a.getUpdatedAt()));
        return result;
    }

    public Optional<TaskTemplate> getTemplate(String id) {
        return Optional.ofNullable(templates.get(id));
    }

    public TaskTemplate createTemplate(TaskTemplate template) {
        String id = "tpl-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 4);
        long now = System.currentTimeMillis();
        template.setId(id);
        template.setCreatedAt(now);
        template.setUpdatedAt(now);
        templates.put(id, template);
        return template;
    }

    public Optional<TaskTemplate> updateTemplate(String id, TaskTemplate updates) {
        TaskTemplate existing = templates.get(id);
        if (existing == null) return Optional.empty();
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getWaypoints() != null) existing.setWaypoints(updates.getWaypoints());
        if (updates.getDroneConfig() != null) existing.setDroneConfig(updates.getDroneConfig());
        if (updates.getSelectedAlgorithm() != null) existing.setSelectedAlgorithm(updates.getSelectedAlgorithm());
        existing.setUpdatedAt(System.currentTimeMillis());
        return Optional.of(existing);
    }

    public boolean deleteTemplate(String id) {
        return templates.remove(id) != null;
    }
}
