sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Table",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function(Controller, JSONModel, jQuery, MessageToast, ResourceModel, Column, ColumnListItem, Label, Text, Table, Export, ExportTypeCSV) {
	"use strict";

	var CController = Controller.extend("BlackBird_v1.controller.api", {

		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel);
			
			this.getView().byId("Excel2").setVisible(false);
		},
		_loadChannelMessages: function(company) {
			var oView = this.getView();
			oView.setBusy(true);
			var self = this;
			var a = "https://";
			var b = "www.quandl.com/api/v3/datasets/NSE/";
			var c = company + ".json?api_key=aAuvB41x9Evoi4A87TAj&start_date=2010-03-09";
			$.ajax({
					type: 'GET',
					url: a + b + c,
					async: false
				}).done(function(results) {
					self.getView().getModel().setProperty("/data", results.dataset);
					oView.setBusy(false);
				})
				.fail(function(err) {
				
				    oView.setBusy(false);
					if (err !== undefined) {
						self.getView().byId("Excel2").setVisible(false);
						var oErrorResponse = $.parseJSON(err.responseText);
						sap.m.MessageToast.show("Invalid company code", {
							duration: 6000
						});
						
					} else {
						sap.m.MessageToast.show("Unknown error!");
					}
				});

		},
		generateTable: function() {
			var oTable = this.getView().byId("Excel2");
			var oModel = this.getView().getModel();
			var oModelData = oModel.getProperty("/data");
			var oColumns = oModelData.column_names;
			var oColumnNames = [];
			$.each(oColumns, function(i, value) {
				oColumnNames.push({
					Text: oColumns[i]
				});
			});
			oModel.setProperty("/columnNames", oColumnNames);
			var oTemplate = new Column({
				header: new Label({
					text: "{Text}"
				})
			});
			oTable.bindAggregation("columns", "/columnNames", oTemplate);
			var oItemTemplate = new ColumnListItem();
			var oTableHeaders = oTable.getColumns();
			$.each(oTableHeaders, function(j, value) {
				var oHeaderName = oTableHeaders[j].getHeader().getText();
				oItemTemplate.addCell(new Text({
					text: "{" + oHeaderName + "}"
				}));
			});
			oTable.bindItems("/properjson", oItemTemplate);
			this.getView().byId("comp").setText(oModelData.name);
			
		
		},
		properjson: function(oModel) {
			var result = [];
			var headers = oModel.column_names;
			for (var i = 1; i < oModel.data.length - 1; i++) {
				var obj = {};
				var currentline = oModel.data[i];
				for (var j = 0; j < headers.length; j++) {
					obj[headers[j]] = currentline[j];
				}
				result.push(obj);
			}
			var count = j;
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			this.getView().getModel().setProperty("/properjson", oFinalResult);
			this.generateTable();

		},
		onPressNavToDetail: function(oEvent) {
			var company = this.getView().byId("inputUrl").getValue();
			if(company!==""){
			this._loadChannelMessages(company);
			this.properjson(this.getView().getModel().getProperty("/data"));
			this.getView().byId("Excel2").setVisible(true);}
			else{
				this.getView().byId("Excel2").setVisible(false);
			}
		},

		onExport: sap.m.Table.prototype.exportData || function(oEvent) {

			var oExport = new Export({

				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),

				models: this.getView().getModel(),
				rows: {
					path: "/properjson"
				},
				columns: [{
						name: "Total Trade Quantity",
						template: {
							content: "{Total Trade Quantity}"
						}
					}, {
						name: "Open",
						template: {
							content: "{Open}"
						}
					}, {
						name: "High",
						template: {
							content: "{High}"
						}
					}, {
						name: "Low",
						template: {
							content: "{Low}"
						}
					}, {
						name: "Last",
						template: {
							content: "{Last}"
						}
					}, {
						name: "Close",
						template: {
							content: "{Close}"
						}
					},

					{
						name: "Turnover (Lacs)",
						template: {
							content: "{Turnover (Lacs)}"
						}
					}
				]
			});
			oExport.saveFile().catch(function(oError) {
				MessageToast.show("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},
		save:function(){
		    var oTable = this.getView().byId("Excel2");
			var oBinding = oTable.getBinding("items");
			var oModel=oBinding.getModel();
			var oModelData = oModel.getProperty("/properjson");
		    var JSONString1 = JSON.stringify(oModelData);
		    var JSONString="{"+"\"name\":\""+oModel.getProperty("/data").dataset_code+"\","+"\"data\":"+JSONString1+"}";
           
			$.post("/destinations/Blackbird_01/stockmarket.xsjs", 
				{
					json: JSONString
				} 
			).done(function(data) { //Success function call
				MessageToast.show("Data returned rom XSJS: " + data);
			});
		}

	});

	return CController;

});