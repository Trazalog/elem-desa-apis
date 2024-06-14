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
      var jsonData = {
        productCode: data[headers.indexOf("Código Interno")],
        productDescription: data[headers.indexOf("Descripción del Producto")],
        invoicesQuantity : parseInt(data[headers.indexOf("Facturas")]),
        presence: parseFloat(parseFloat(data[headers.indexOf("Presencia")]).toFixed(2)), 
        subtotal: parseFloat(parseFloat(data[headers.indexOf("Subtotal del Producto")]).toFixed(2)), 
        discount: parseFloat(parseFloat(data[headers.indexOf("Descuento del Producto")]).toFixed(2)), 
        taxes: parseFloat(parseFloat(data[headers.indexOf("Impuesto del Producto")]).toFixed(2)),
        total: parseFloat(parseFloat(data[headers.indexOf("Total del Producto")]).toFixed(2)),
        unitsSold: parseInt(data[headers.indexOf("Unidades Vendidas")])
      };

      if (headers.indexOf("Día del año") != -1) {
        jsonData.day = data[headers.indexOf("Día del año")];
      }
      if (headers.indexOf("Semana") != -1) {
        jsonData.week = parseInt(data[headers.indexOf("Semana")]);
      }
      if (headers.indexOf("Mes")  != -1) {
        jsonData.month = parseInt(data[headers.indexOf("Mes")]);
      }
      if (headers.indexOf("Año") != -1) {
        jsonData.year = parseInt(data[headers.indexOf("Año")]);
      }
      if (headers.indexOf("Período Comprendido")) {
        jsonData.dateRange = data[headers.indexOf("Período Comprendido")];
      }
      stores[storeName].productsEvolution.push(jsonData);
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

