function mapCsvToJson(mc) {
  try {
    var log = mc.getServiceLog();
    var payload = mc.getPayloadXML();
    var lines = payload.split("\n");
    lines.splice(0, 3); // corto las primeras 3 lineas del CSV, que no son datos
    var headers = lines[0].split(","); // guardo la primera linea del CSV, que son los headers
    var stores = {};
    // iterate over the CSV data
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // split the CSV row into data
      var storeName = data[headers.indexOf("Nombre Local")];
      // create a new object for each row, with the desired structure
      if (!stores[storeName]) {
        stores[storeName] = {
          storeName: data[headers.indexOf("Nombre Local")],
          summaryPerCategory: [],
        };
      }
      stores[storeName].summaryPerCategory.push({
        categoryDescription: data[headers.indexOf("Descripción de la Categoría")],
        categoryDetail: data[headers.indexOf("Detalle de la Categoría")] ? data[headers.indexOf("Detalle de la Categoría")].replace(/"/g, '') : '',
        invoicesQuantity : parseInt(data[headers.indexOf("Facturas")]),
        subtotal: parseFloat(parseFloat(data[headers.indexOf("Subtotal de la Categoría")]).toFixed(2)), 
        discount: parseFloat(parseFloat(data[headers.indexOf("Descuento de la Categoría")]).toFixed(2)), 
        taxes: parseFloat(parseFloat(data[headers.indexOf("Impuesto de la Categoría")]).toFixed(2)), 
        total: parseFloat(parseFloat(data[headers.indexOf("Total de la Categoría")]).toFixed(2)),
        unitsSold: parseInt(data[headers.indexOf("Unidades Vendidas")]),
      });
    }
    var json = {};
    json.stores = Object.keys(stores).map(function(key) {
      return stores[key];
    }); // convert the invoices object to an array
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

