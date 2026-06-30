package com.roostercode.helpdesk.wiki;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/wiki")
public class WikiController {

    private final WikiService service;

    public WikiController(WikiService service) {
        this.service = service;
    }

    @GetMapping("/arbol")
    public List<WikiNodo> arbol() {
        return service.arbol();
    }

    @GetMapping("/articulo")
    public ResponseEntity<?> leerArticulo(@RequestParam String ruta) {
        try {
            return ResponseEntity.ok(new ArticuloResponse(ruta, service.leerArticulo(ruta)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (WikiPathException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/articulo")
    public ResponseEntity<?> guardarArticulo(@RequestParam String ruta, @Valid @RequestBody GuardarArticuloRequest req) {
        try {
            service.guardarArticulo(ruta, req.contenido());
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (WikiPathException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/carpeta")
    public ResponseEntity<?> crearCarpeta(@Valid @RequestBody CrearNodoRequest req) {
        try {
            WikiNodo creado = service.crearCarpeta(req.rutaPadre(), req.nombre());
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (WikiYaExisteException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (WikiPathException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/articulo")
    public ResponseEntity<?> crearArticulo(@Valid @RequestBody CrearNodoRequest req) {
        try {
            WikiNodo creado = service.crearArticulo(req.rutaPadre(), req.nombre());
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (WikiYaExisteException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (WikiPathException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/nodo")
    public ResponseEntity<?> eliminar(@RequestParam String ruta) {
        try {
            service.eliminar(ruta);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (WikiPathException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
