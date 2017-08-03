sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/table/SortOrder",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageToast, Filter, FilterOperator, Sorter, SortOrder) {
	"use strict";
	var noOfSorts = 0;
    var file_name;
	return Controller.extend("BlackBird_v1.controller.iotview", {
	
		handleToggleSecondaryContent: function(oEvent) {
			var oSplitContainer = this.getView().byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		},
		positionSort: function(Event) {
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "Position";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Ascending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 0;
		},
		onSort: function(Event) {
			if (noOfSorts < 1) {
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "category";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Ascending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 1;
			} else if (noOfSorts < 2) {
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "# of Google searches";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Descending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 2;
			} else if (noOfSorts < 3) {;
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "# of Linkedin posts";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Descending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 3;
			} else if (noOfSorts < 4) {
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "# of tweets";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Descending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 4;
			} else {
				var oView = this.getView();
				var oTable = oView.byId("idTable");
				var oBinding = oTable.getBinding("items");
				var aSorters = [];
				var sPath = "Position";
				var GROUP = false;
				aSorters.push(new sap.ui.model.Sorter(sPath, SortOrder.Ascending, GROUP));
				oBinding.sort(aSorters);
				noOfSorts = 0;
			}
		},

		onIconPress: function(Event) {
			var sideNavigation = this.getView().byId('sideNavigation');
			var expanded = !sideNavigation.getExpanded();

			sideNavigation.setExpanded(expanded);

		},

		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel);
			this.getView().byId("idTable").setVisible(false);
		},

		onNavtoExcel: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("view1");
		},
		onNavToApi: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("");

		},
		onSearch: function(oEvt) {

			// add filter for search
			var aFilters = [];

			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("category", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			// update list binding
			var table = this.getView().byId("idTable");
			var binding = table.getBinding("items");
			binding.filter(aFilters);
		},
		csvJSON: function(csv) {
			var lines = csv.split("\n");
			var result = [];
			var headers = lines[0].split(",");
			for (var i = 1; i < lines.length - 1; i++) {
				var obj = {};
				var currentline = lines[i].split(",");
				for (var j = 0; j < headers.length; j++) {
					if(j!=0)
					{
						currentline[j]=parseFloat(currentline[j],10);
					}
					obj[headers[j]] = currentline[j];
				}
				result.push(obj);
			}
			var count = j;
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			//return result; //JavaScript object
			this.getView().getModel().setProperty("/", oFinalResult);
			this.getView().byId("idTable").setVisible(true);
		},
		onConfirmDialog: function() {
			var that = this;
			
				var upl = new sap.ui.unified.FileUploader({
					width: '100%',
					uploadUrl: 'upload/',
					change: function(oEvent) {
						var file = oEvent.getParameter("files")[0];
						if (file && window.FileReader) {
						  file_name=upl.getValue();
						  file_name=file_name.split(".");
							var reader = new FileReader();
							reader.onload = function(evn) {
								var strCSV = evn.target.result; //string in CSV 
								that.csvJSON(strCSV);
							};
							reader.readAsText(file);
						}
						dialog.close();

					}
				});
				
			var dialog = new sap.m.Dialog({
				title: 'Upload',
				type: 'Message',
				icon: 'sap-icon://upload',
				content: [
				upl
				],

				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				})
			});
			dialog.open();
		},save: function() {
				var oTable = this.getView().byId("Excel2");
				var oBinding = oTable.getBinding("items");
				var oModel = oBinding.getModel();
				var oModelData = oModel.getProperty("/");
				var JSONString1 = JSON.stringify(oModelData);
				var JSONString = "{" + "\"data\":" + JSONString1 + "}";
				$.post("/destinations/Blackbird_01/trial.xsjs", {
						json: JSONString,
						name: file_name[0]
					}).done(function(data) {MessageToast.show("Data returned rom XSJS: " + data);
				});
		}
	});
});