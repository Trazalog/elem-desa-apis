function mapCsvToJson(mc) {
  try {
    var log = mc.getServiceLog();
    var payload = mc.getPayloadXML();
    var lines = payload.split("\n");
    lines.splice(0, 3); // corto las primeras 3 lineas del CSV, que no son datos
    var headers = lines[0].split(","); // guardo la primera linea del CSV, que son los headers
    var invoices = {};

    // iterate over the CSV data
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // split the CSV row into data
      var invoiceId = data[headers.indexOf("ID Factura Local")];

      // create a new object for each row, with the desired structure
      if (!invoices[invoiceId]) {
        invoices[invoiceId] = {
          storeName: data[headers.indexOf("Nombre Local")],
          subgroup: data[headers.indexOf("Subgrupo")],
          invoiceNumber: invoiceId,
          closingDate: data[headers.indexOf("Fecha Fin Transacción")],
          openDate: data[headers.indexOf("Fecha Inicio Transacción")],
          shortDate: data[headers.indexOf("Fecha Corta Transacción")],
          clientName: data[headers.indexOf("Nombre del Cliente")],
          clientId: data[headers.indexOf("Cédula del Cliente")],
          diners: data[headers.indexOf("Comensales")],
          othersTags: {
            Tipoorden: data[headers.indexOf("Tipoorden")] ? data[headers.indexOf("Tipoorden")].replace(/"/g, '') : '',
          },
          waiterTags: {
            Mesonero: data[headers.indexOf("Mesonero")],
            Area: data[headers.indexOf("Area")],
            Turno: data[headers.indexOf("Turno")],
          },
          invoiceDetails: [],
        };
      }
      invoices[invoiceId].invoiceDetails.push({
        productCode: data[headers.indexOf("Código Interno del Producto")],
        productDescription: data[headers.indexOf("Descripción del Producto")],
        category : data[headers.indexOf("Descripción de la Categoría")] ? data[headers.indexOf("Descripción de la Categoría")].replace(/"/g, '') : '',
        subtotal: data[headers.indexOf("Subtotal")], 
        discount: data[headers.indexOf("Descuento")], 
        tax: data[headers.indexOf("Impuestos")], 
        total: data[headers.indexOf("Total")],
        unit: data[headers.indexOf("Unidades Vendidas")],
        price: data[headers.indexOf("Precio")],
      });
    }
    var json = {};
    json.invoices = Object.keys(invoices).map(function(key) {
      return invoices[key];
    }); // convert the invoices object to an array
    var newPayload = JSON.stringify(json);
    mc.setProperty("newPayload", newPayload);

    return true;
  } catch (error) {
    log.info("mapCsvToJson ERROR: " + error);

    return false;
  }
}
