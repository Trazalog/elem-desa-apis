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
          closingDate: formatDate(data[headers.indexOf("Fecha Fin Transacción")],log),
          openDate: formatDate(data[headers.indexOf("Fecha Inicio Transacción")],log),
          shortDate: formatDate(data[headers.indexOf("Fecha Corta Transacción")] ? data[headers.indexOf("Fecha Corta Transacción")] : '',log),
          clientName: data[headers.indexOf("Nombre del Cliente")],
          clientId: data[headers.indexOf("Cédula del Cliente")],
          diners: parseInt(data[headers.indexOf("Comensales")]),
          othersTags: {
            Tipoorden: data[headers.indexOf("Tipoorden")] ? data[headers.indexOf("Tipoorden")].replace(/"/g, '') : '',
          },
          waiterTags: [
            {
              name : "Mesonero",
              value : data[headers.indexOf("Mesonero")] ? data[headers.indexOf("Mesonero")] : '',
            },
            {
              name : "Area",
              value : data[headers.indexOf("Area")] ? data[headers.indexOf("Area")] : '',
            },
            {
              name : "Turno",
              value : data[headers.indexOf("Turno")] ? data[headers.indexOf("Turno")]: '',
            }
          ],
    invoiceDetails: [],
        };
      }
      invoices[invoiceId].invoiceDetails.push({
        productCode: data[headers.indexOf("Código Interno del Producto")],
        productDescription: data[headers.indexOf("Descripción del Producto")],
        category : data[headers.indexOf("Descripción de la Categoría")] ? data[headers.indexOf("Descripción de la Categoría")].replace(/"/g, '') : '',
        subtotal: parseFloat(parseFloat(data[headers.indexOf("Subtotal")]).toFixed(2)), 
        discount: parseFloat(parseFloat(data[headers.indexOf("Descuento")]).toFixed(2)), 
        tax: parseFloat(parseFloat(data[headers.indexOf("Impuestos")]).toFixed(2)), 
        total: parseFloat(parseFloat(data[headers.indexOf("Total")]).toFixed(2)),
        unit: parseInt(data[headers.indexOf("Unidades Vendidas")]),
        price: parseFloat(parseFloat(data[headers.indexOf("Precio")]).toFixed(2)),
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
    var log = mc.getServiceLog();
    log.info("ERROR");
    log.info(error);

    return false;
  }
}

function formatDate(dateString, log) {
	var dateAndTimeParts = dateString.split(" ");
	var dateParts = dateAndTimeParts[0].split("/");
	var HH = '';
	var mm = '';

	var timeParts = dateAndTimeParts[1] ? dateAndTimeParts[1].split(":") : null;
	var date = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];

	if (timeParts !== null && timeParts.length == 2) {
		HH = timeParts[0] ? timeParts[0] : '';
		mm = timeParts[1] ? timeParts[1] : '';
		date = date + " " + HH + ":" + mm;
	}
	
	return date;
}