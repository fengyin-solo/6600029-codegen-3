package com.drone.controller;

import com.drone.model.TaskTemplate;
import com.drone.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public List<TaskTemplate> listTemplates(
            @RequestParam(required = false) String category) {
        return templateService.listTemplates(category);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTemplate(@PathVariable String id) {
        return templateService.getTemplate(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TaskTemplate createTemplate(@RequestBody TaskTemplate template) {
        return templateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody TaskTemplate updates) {
        return templateService.updateTemplate(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTemplate(@PathVariable String id) {
        boolean deleted = templateService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("success", deleted));
    }
}
