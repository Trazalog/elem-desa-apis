function mapCsvToJson(mc) {
  try {
    var log = mc.getServiceLog();
    var payload = mc.getPayloadXML();
    var lines = payload.split("\n");
    lines.splice(0, 3); // corto las primeras 3 lineas del CSV, que no son datos
    var headers = lines[0].split(","); // guardo la primera linea del CSV, que son los headers
    var productsSummary = {};

    // Loopeo sobre la data del CSV
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); //spliteo la fila del CSV 
      var storeName = data[headers.indexOf("Nombre Local")];

      // creo el json con la estructura deseada
      if (!productsSummary[storeName]) {
        productsSummary[storeName] = {
          storeId: data[headers.indexOf("Nombre Local")],
          productsSummary: [],
        };
      }
      //Creo el detalle del report agrupando por tienda
      productsSummary[storeName].productsSummary.push({
        productCode: data[headers.indexOf("Código Interno")],
        productDescription: data[headers.indexOf("Descripción del Producto")] ? data[headers.indexOf("Descripción del Producto")].replace(/"/g, '') : '',
        invoicesQuantity: parseInt(data[headers.indexOf("Facturas")]),
        categoryDescription : data[headers.indexOf("Descripción de la Categoría")] ? data[headers.indexOf("Descripción de la Categoría")].replace(/"/g, '') : '',
        proportionProductInvoice: parseFloat(parseFloat(data[headers.indexOf("Presencia")]).toFixed(2)), 
        subtotal: parseFloat(parseFloat(data[headers.indexOf("Subtotal del Producto")]).toFixed(2)), 
        discount: parseFloat(parseFloat(data[headers.indexOf("Descuento del Producto")]).toFixed(2)), 
        taxes: parseFloat(parseFloat(data[headers.indexOf("Impuesto del Producto")]).toFixed(2)),
        total: parseFloat(parseFloat(data[headers.indexOf("Total del Producto")]).toFixed(2)),
        unitsSold: parseInt(data[headers.indexOf("Unidades Vendidas")]),
      });
    }
    var json = {};
    json.reports = Object.keys(productsSummary).map(function(key) {
      return productsSummary[key];
    }); // convierto el json en un array
    var newPayload = JSON.stringify(json);
    mc.setProperty("newPayload", newPayload);

    return true;
  } catch (error) {
    var log = mc.getServiceLog();
    log.info("ERROR");
    log.info(error);

    return false;
  }
}
