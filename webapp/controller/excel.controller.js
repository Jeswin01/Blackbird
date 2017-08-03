sap.ui.define([
	'jquery.sap.global',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/ui/unified/FileUploader',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Text',
	'sap/m/Table',
	'sap/m/Input'
], function(jQuery, MessageToast, Fragment, Controller, Filter, JSONModel, FileUploader, Column, ColumnListItem, Label, Text, Table ,Input) {
	"use strict";
	var file_name;
	var that;
	var excelorcsv;
	var CController = Controller.extend("BlackBird_v1.controller.excel", {

		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(10000);
			this.getView().setModel(oModel);
			this.oEditableTemplate = null;
			this.oTable = this.getView().byId("Excel2");
			this.oTable.setVisible(false);
		},

		rebindTable: function(oTemplate, sKeyboardMode) {
			var that = this;
			this.oTable.bindItems({
				path: that.rebindProperty,
				template: oTemplate
				// key: "Id"
			}).setKeyboardMode(sKeyboardMode);
		},
		
		onEdit: function() {
			this.aProductCollection = jQuery.extend(true, [], this.getView().getModel().getProperty(this.rebindProperty));
			this.getView().byId("editButton").setVisible(false);
			this.getView().byId("saveButton").setVisible(true);
			this.getView().byId("cancelButton").setVisible(true);
			this.editTable();
			this.rebindTable(this.oEditableTemplate, "Edit");
		},

		onSave: function() {
			this.getView().byId("saveButton").setVisible(false);
			this.getView().byId("cancelButton").setVisible(false);
			this.getView().byId("editButton").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onCancel: function() {
			this.getView().byId("cancelButton").setVisible(false);
			this.getView().byId("saveButton").setVisible(false);
			this.getView().byId("editButton").setVisible(true);
			this.getView().getModel().setProperty(this.rebindProperty, this.aProductCollection);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},
		
		onUploadXLSX: function() {
			var that = this;
			var upl=	new sap.ui.unified.FileUploader({
						width: '100%',
						uploadUrl: 'upload/',
						change: function(oEvent) {
							that.doSomething(oEvent);
							file_name = upl.getValue();
							file_name = file_name.split(".");
							// var file = oEvent.getParameter("files")[0];
							// if (file && window.FileReader) {
							// 	var reader = new FileReader();
							// 	reader.onload = function(evn) {
							// 		var strCSV = evn.target.result; //string in CSV 
							// 		that.csvJSON(strCSV);
							// 	};
							// 	reader.readAsText(file);
							// }
							dialog.close();
							that.getView().byId("Excel2").setVisible(true);
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
		},

		doSomething: function(e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
			file_name= e.getParameter("files")[0];
		
		},
		
		_import: function(file) {
			if (file && window.FileReader) {
				var reader = new FileReader();
				that = this;
				var result = {};
				reader.onload = function(e) {
					var data = e.target.result;
					var wb = XLSX.read(data, {
						type: 'binary'
					});
					wb.SheetNames
						.forEach(function(sheetName) {
							var roa = XLSX.utils
								.sheet_to_row_object_array(wb.Sheets[sheetName]);
							if (roa.length > 0) {
								result[sheetName] = roa;
								// alert(JSON.stringify(result));
								var oStringResult = JSON.stringify(result);
								var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
								that.getView().getModel().setProperty("/data", oFinalResult);
								// MessageToast.show(oStringResult);
								var title = oStringResult.split("\"");
								// MessageToast.show(title[1]);
								var pty = "/data" + "/" + title[1];
								file_name= oStringResult.split("\"");
								file_name[0]=file_name[1];
								that.rebindProperty = pty;
								that.generateTable(pty);
								excelorcsv=1;
							//	MessageToast.show(JSON.stringify(oModelData));
							}
						});
				};
				reader.readAsBinaryString(file);
			}
		},
		editTable: function() {
			var oEditableTemplate = new ColumnListItem();
			var oHeaders = this.oTable.getColumns();
			var oHeaderName;
			$.each(oHeaders, function(i, value) {
				oHeaderName = oHeaders[i].getHeader().getText();
				oEditableTemplate.addCell(new Input({
					value: "{" + oHeaderName + "}"
				}));
			});
			// MessageToast.show(oHeaderName);
			this.oEditableTemplate = oEditableTemplate;
		},
		

		
		onMenuClick: function(oEvent) {
			var sideNavigation = this.getView().byId("SplitAppDemo");

			if (sideNavigation.getMode() == "ShowHideMode" || sideNavigation.getMode() == "StretchCompressMode") {
				sideNavigation.setMode(sap.m.SplitAppMode.HideMode);
			} else {
				sideNavigation.setMode(sap.m.SplitAppMode.StretchCompressMode);
			}
		},

		autohide: function(oEvent) {
			var sideNavigation = this.getView().byId("SplitAppDemo");

			sideNavigation.setMode(sap.m.SplitAppMode.HideMode);

		},

		onLogClick: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("logout");
		},

		csvJSON: function(csv) {
			var lines = csv.split("\n");
			var result = [];
			var headers = lines[0].split(",");
			for (var i = 1; i < lines.length - 1; i++) {
				var obj = {};
				var currentline = lines[i].split(",");
				for (var j = 0; j < headers.length; j++) {
					obj[headers[j]] = currentline[j];
				}
				result.push(obj);
			}
			var count = j;
			var oStringResult = JSON.stringify(result);
			var oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));
			this.getView().getModel().setProperty("/", oFinalResult);
			this.rebindProperty = "/";
			this.generateTable("/");
			excelorcsv=0;
		},

		generateTable: function(property) {
			var oTable = this.getView().byId("Excel2");
			var oModel = this.getView().getModel();
			var oModelData = oModel.getProperty(property);
			var oColumns = Object.keys(oModelData[0]);
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
			this.oEditableTemplate = new ColumnListItem();
			var oTableHeaders = oTable.getColumns();
			$.each(oTableHeaders, function(j, value) {
				var oHeaderName = oTableHeaders[j].getHeader().getText();
				oItemTemplate.addCell(new Text({
					text: "{" + oHeaderName + "}"
				}));
			});
			// MessageToast.show(property);
			oTable.bindItems(property, oItemTemplate);
			this.getView().byId("Excel2").setVisible(true);

			this.oReadOnlyTemplate = this.getView().byId("Excel2").removeItem(0);
			this.rebindTable(this.oReadOnlyTemplate, "Navigation");
		},

		onConfirmDialog: function() {
			var that = this;
			var upl = new sap.ui.unified.FileUploader({
				width: '100%',
				uploadUrl: 'upload/',
				change: function(oEvent) {
					var file = oEvent.getParameter("files")[0];
					if (file && window.FileReader) {
						file_name = upl.getValue();
						file_name = file_name.split(".");
						var reader = new FileReader();
						reader.onload = function(evn) {
							var strCSV = evn.target.result; //string in CSV 
							that.csvJSON(strCSV);
						};
						reader.readAsText(file);
					}
					dialog.close();
					that.getView().byId("Excel2").setVisible(true);

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

		},

		onPressNavToExcel: function(oEvent) {
			this.getSplitAppObj().to(this.createId("home"));
		},
		onPressNavToCust: function(oEvent) {
			this.getSplitAppObj().to(this.createId("customer"));
			var sideNavigation = this.getView().byId("SplitAppDemo");
			sideNavigation.setMode(sap.m.SplitAppMode.HideMode);
		},

		onPressDetailBack: function() {
			this.getSplitAppObj().backDetail();
		},

		onPressMasterBack: function() {
			this.getSplitAppObj().backMaster();
		},

		onPressGoToMaster: function() {
			this.getSplitAppObj().toMaster(this.createId("master2"));
		},

		onPressGoToMaster1: function() {
			this.getSplitAppObj().toMaster(this.createId("master3"));
		},

		onListItemPress: function(oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObj().toDetail(this.createId(sToPageId));
		},

		onPressModeBtn: function(oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitAppObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, {
				duration: 5000
			});
		},
		
		onDataExport: sap.m.Table.prototype.exportData || function(oEvent) {
			var that = this;
			var oModel = this.getView().getModel();
			var oModelData = oModel.getProperty(this.rebindProperty);
			var oColumns = Object.keys(oModelData[0]);
			var oColumnNames = [];
			 $.each(oColumns, function(i, value) {
				oColumnNames.push({
					name: oColumns[i],
					template: {
						content: "{" + oColumns[i] + "}"
					}
				});
			});
			var oExport = new sap.ui.core.util.Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ","
				}),
				// Pass in the model created above
				models: this.getView().getModel(),
				// binding information for the rows aggregation
				rows: {
					path: that.rebindProperty
				},
				// column definitions with column name and binding info for the content
				columns: oColumnNames
			});
			// download exported file
			oExport.saveFile().catch(function(oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});

		},
		save: function() {
			var oTable = this.getView().byId("Excel2");
			var oBinding = oTable.getBinding("items");
			var oModel = oBinding.getModel();
			if(excelorcsv===0){
			var oModelData = oModel.getProperty("/");}
			else if(excelorcsv===1){
			var oModelData = oModel.getProperty("/data/"+file_name[0]);
			}
			var JSONString1 = JSON.stringify(oModelData);
			var JSONString = "{" + "\"data\":" + JSONString1 + "}";
			//MessageToast.show(JSONString);
			$.post("/destinations/Blackbird_01/trial.xsjs", {
				json: JSONString,
				name: file_name[0]
			}).done(function(data) {
				MessageToast.show("Data returned rom XSJS: " + data);
			});
		}

	});

	return CController;

});