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
          productsEvolution: [],
        };
      }
      stores[storeName].productsEvolution.push({
        productCode: data[headers.indexOf("Código Interno")],
        productDescription: data[headers.indexOf("Descripción del Producto")],
        invoicesQuantity : data[headers.indexOf("Facturas")],
        presence: data[headers.indexOf("Presencia")], 
        subtotal: data[headers.indexOf("Subtotal del Producto")], 
        discount: data[headers.indexOf("Descuento del Producto")], 
        taxes: data[headers.indexOf("Impuesto del Producto")],
        total: data[headers.indexOf("Total del Producto")],
        unitsSold: data[headers.indexOf("Unidades Vendidas")],
        month: data[headers.indexOf("Mes")],
        year: data[headers.indexOf("Año")],        
        dateRange: data[headers.indexOf("Período Comprendido")], 
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

