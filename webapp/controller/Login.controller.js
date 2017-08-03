sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("BlackBird_v1.controller.Login", {

		onClick: function(oEvent) {
			var email = this.byId("ee").getValue();
			var pass = this.byId("pp").getValue();
			var that = this;
			$.post("/destinations/Blackbird_01/admin_login.xsjs", {
				email: email,
				password: pass
			}).done(function(data) {
				if (data === "2") {
						MessageToast.show("no such user exists");
				} else if (data === '0') {
					MessageToast.show("wrong password");
				} else {
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("currentmarket",{details:data});
					MessageToast.show("login successful");
				}
			});
		},
		validate: function() {
			var email = this.byId("ee").getValue();
			var pass = this.byId("pp").getValue();

		},
		onSignUpClick: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("signup");
		}
	});

});