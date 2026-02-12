"""
generate_xlsx.py — Script para generar órdenes de producción (.xlsx)
Recibe datos por JSON y usa openpyxl para escribir en la plantilla.
Restaura imágenes originales que openpyxl pierde al guardar.

Uso: python generate_xlsx.py <input_json_path> <output_xlsx_path>
"""
import sys
import json
import zipfile
import os
import openpyxl

# Mapa de tallas: tipo -> talla -> celda de Excel
MAPA_TALLAS = {
    'DAMA': {
        'XCH': 'F22', 'CH': 'H22', 'MD': 'J22', 'GD': 'L22',
        'XL': 'N22', 'XXL': 'P22', 'XXXL': 'R22',
    },
    'CABALLERO': {
        'XCH': 'F23', 'CH': 'H23', 'MD': 'J23', 'GD': 'L23',
        'XL': 'N23', 'XXL': 'P23', 'XXXL': 'R23',
    },
    'INFANTIL': {
        'XCH': 'F21', 'CH': 'H21', 'MD': 'J21', 'GD': 'L21',
        'XL': 'N21', 'XXL': 'P21', 'XXXL': 'R21',
    },
}


def generate(input_json_path: str, output_path: str):
    # Leer datos de entrada
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    template_path = data['template_path']
    folio = data['folio']
    fecha_pedido = data['fecha_pedido']
    cliente = data['cliente']
    cantidad_total = data['cantidad_total']
    tela = data['tela']
    modelo = data['modelo']
    tallas = data.get('tallas', [])

    # --- 1. Abrir plantilla con openpyxl ---
    wb = openpyxl.load_workbook(template_path)
    ws = wb['PORTADA']

    # --- 2. Escribir datos principales ---
    ws['L5'] = folio
    ws['L6'] = fecha_pedido
    ws['D9'] = cliente
    ws['K12'] = f'{cantidad_total} PLAYERAS'
    ws['C19'] = tela
    ws['H19'] = modelo

    # --- 3. Escribir tallas ---
    for talla_item in tallas:
        tipo = talla_item['tipo'].upper()
        talla = talla_item['talla'].upper()
        cantidad = talla_item.get('cantidad', 1)

        tipo_map = MAPA_TALLAS.get(tipo)
        if not tipo_map:
            print(f'WARN: Tipo "{tipo}" no válido, saltando', file=sys.stderr)
            continue

        cell_addr = tipo_map.get(talla)
        if not cell_addr:
            print(f'WARN: Talla "{talla}" no válida para tipo "{tipo}", saltando', file=sys.stderr)
            continue

        ws[cell_addr] = cantidad

    # --- 4. Guardar con openpyxl (temporal) ---
    temp_file = output_path + '.tmp.xlsx'
    wb.save(temp_file)
    wb.close()

    # --- 5. Restaurar imágenes originales ---
    # openpyxl pierde las imágenes al guardar. Tomamos el archivo generado
    # por openpyxl (con datos correctos) y le inyectamos de vuelta los
    # archivos de media, drawings y sus rels desde la plantilla original.
    orig_files = {}
    with zipfile.ZipFile(template_path, 'r') as orig_zip:
        for name in orig_zip.namelist():
            if ('media/' in name or 'drawings/' in name):
                orig_files[name] = orig_zip.read(name)

    with zipfile.ZipFile(temp_file, 'r') as gen_zip:
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as out_zip:
            # Copiar todo lo que generó openpyxl
            for item in gen_zip.infolist():
                data = gen_zip.read(item.filename)
                # Reemplazar media/drawings con las originales si existen
                if item.filename in orig_files:
                    data = orig_files[item.filename]
                out_zip.writestr(item.filename, data)

            # Agregar archivos originales que openpyxl haya omitido
            gen_names = set(gen_zip.namelist())
            for name, data in orig_files.items():
                if name not in gen_names:
                    out_zip.writestr(name, data)

    # Limpiar temporal
    if os.path.exists(temp_file):
        os.remove(temp_file)

    print(json.dumps({'success': True, 'output': output_path}))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(json.dumps({'success': False, 'error': 'Uso: python generate_xlsx.py <input.json> <output.xlsx>'}))
        sys.exit(1)

    try:
        generate(sys.argv[1], sys.argv[2])
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
