# Diseños de referencia (Figma)

Esta carpeta contiene los exports de Figma que se usan como referencia para
implementar el frontend. **No forman parte del bundle de producción**; son
material de trabajo.

## Cómo exportar desde Figma

1. Selecciona el frame o componente en Figma.
2. Panel derecho → sección *Export* → añade formato:
   - **SVG** para iconos, logos y elementos vectoriales.
   - **PNG @2x** para pantallas completas y maquetas.
3. Exporta y guarda el archivo en esta carpeta.

## Convención de nombres

```
<área>-<pantalla>-<elemento>.<ext>
```

Ejemplos:

- `home-desktop.svg`
- `home-mobile.png`
- `checkout-resumen@2x.png`

Si un diseño tiene varios estados, sufija con el estado:
`boton-hover.svg`, `card-activo.png`, etc.
