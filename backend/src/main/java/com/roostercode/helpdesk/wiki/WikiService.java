package com.roostercode.helpdesk.wiki;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
public class WikiService {

    private static final String EXTENSION = ".md";
    private static final Pattern NOMBRE_VALIDO = Pattern.compile("^[\\p{L}0-9 _.-]{1,120}$");

    private final Path root;

    public WikiService(@Value("${WIKI_DIR:./data/wiki}") String wikiDir) {
        this.root = Path.of(wikiDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear WIKI_DIR: " + root, e);
        }
    }

    public List<WikiNodo> arbol() {
        return listarHijos(root, "");
    }

    public String leerArticulo(String ruta) {
        Path archivo = resolverArticulo(ruta);
        if (!Files.isRegularFile(archivo)) {
            throw new NoSuchElementException("Artículo no encontrado");
        }
        try {
            return Files.readString(archivo, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el artículo", e);
        }
    }

    public void guardarArticulo(String ruta, String contenido) {
        Path archivo = resolverArticulo(ruta);
        if (!Files.isRegularFile(archivo)) {
            throw new NoSuchElementException("Artículo no encontrado");
        }
        try {
            Files.writeString(archivo, contenido == null ? "" : contenido, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar el artículo", e);
        }
    }

    public WikiNodo crearCarpeta(String rutaPadre, String nombre) {
        validarNombre(nombre);
        Path padre = resolverCarpeta(rutaPadre);
        Path nueva = dentroDeRaiz(padre.resolve(nombre.trim()));
        if (Files.exists(nueva)) {
            throw new WikiYaExisteException("Ya existe un elemento con ese nombre en esta carpeta");
        }
        try {
            Files.createDirectory(nueva);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear la carpeta", e);
        }
        return new WikiNodo(nombre.trim(), NodoTipo.CARPETA, relativizar(nueva), List.of());
    }

    public WikiNodo crearArticulo(String rutaPadre, String nombre) {
        validarNombre(nombre);
        Path padre = resolverCarpeta(rutaPadre);
        String nombreLimpio = nombre.trim();
        String archivoNombre = nombreLimpio.toLowerCase().endsWith(EXTENSION) ? nombreLimpio : nombreLimpio + EXTENSION;
        Path nuevo = dentroDeRaiz(padre.resolve(archivoNombre));
        if (Files.exists(nuevo)) {
            throw new WikiYaExisteException("Ya existe un elemento con ese nombre en esta carpeta");
        }
        try {
            Files.createFile(nuevo);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo crear el artículo", e);
        }
        String nombreSinExt = archivoNombre.substring(0, archivoNombre.length() - EXTENSION.length());
        return new WikiNodo(nombreSinExt, NodoTipo.ARTICULO, relativizar(nuevo), List.of());
    }

    public void eliminar(String ruta) {
        Path nodo = dentroDeRaiz(resolver(ruta));
        if (nodo.equals(root)) {
            throw new WikiPathException("No se puede eliminar la raíz del wiki");
        }
        if (!Files.exists(nodo)) {
            throw new NoSuchElementException("No encontrado");
        }
        try {
            if (Files.isDirectory(nodo)) {
                try (Stream<Path> walk = Files.walk(nodo)) {
                    walk.sorted(Comparator.reverseOrder()).forEach(this::borrar);
                }
            } else {
                Files.delete(nodo);
            }
        } catch (IOException | UncheckedIOException e) {
            throw new IllegalStateException("No se pudo eliminar", e);
        }
    }

    private void borrar(Path p) {
        try {
            Files.delete(p);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private List<WikiNodo> listarHijos(Path dir, String rutaBase) {
        try (Stream<Path> stream = Files.list(dir)) {
            return stream
                    .filter(p -> Files.isDirectory(p) || p.getFileName().toString().toLowerCase().endsWith(EXTENSION))
                    .sorted(Comparator
                            .comparing((Path p) -> Files.isDirectory(p) ? 0 : 1)
                            .thenComparing(p -> p.getFileName().toString().toLowerCase()))
                    .map(p -> {
                        String nombreArchivo = p.getFileName().toString();
                        String rutaRel = rutaBase.isEmpty() ? nombreArchivo : rutaBase + "/" + nombreArchivo;
                        if (Files.isDirectory(p)) {
                            return new WikiNodo(nombreArchivo, NodoTipo.CARPETA, rutaRel, listarHijos(p, rutaRel));
                        }
                        String nombreSinExt = nombreArchivo.substring(0, nombreArchivo.length() - EXTENSION.length());
                        return new WikiNodo(nombreSinExt, NodoTipo.ARTICULO, rutaRel, List.of());
                    })
                    .toList();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el árbol del wiki", e);
        }
    }

    private Path resolverArticulo(String ruta) {
        Path p = dentroDeRaiz(resolver(ruta));
        if (!p.getFileName().toString().toLowerCase().endsWith(EXTENSION)) {
            throw new WikiPathException("La ruta no corresponde a un artículo .md");
        }
        return p;
    }

    private Path resolverCarpeta(String ruta) {
        Path p = ruta == null || ruta.isBlank() ? root : dentroDeRaiz(resolver(ruta));
        if (!Files.isDirectory(p)) {
            throw new NoSuchElementException("Carpeta padre no encontrada");
        }
        return p;
    }

    private Path resolver(String ruta) {
        String limpia = ruta == null ? "" : ruta.trim().replace("\\", "/");
        while (limpia.startsWith("/")) {
            limpia = limpia.substring(1);
        }
        return limpia.isEmpty() ? root : root.resolve(limpia);
    }

    private Path dentroDeRaiz(Path candidato) {
        Path normalizado = candidato.normalize();
        if (!normalizado.equals(root) && !normalizado.startsWith(root)) {
            throw new WikiPathException("Ruta fuera del directorio permitido");
        }
        return normalizado;
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank() || nombre.contains("..")
                || !NOMBRE_VALIDO.matcher(nombre.trim()).matches()) {
            throw new WikiPathException("Nombre inválido");
        }
    }

    private String relativizar(Path p) {
        return root.relativize(p).toString().replace("\\", "/");
    }
}
