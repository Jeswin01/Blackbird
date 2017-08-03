sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("BlackBird_v1.controller.Signup", {

		onCancel: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("login");
		},
		onSignUp: function(oEvent) {
			var em = this.byId("e").getValue();
			var pass = this.byId("p").getValue();
			var fname = this.byId("ff").getValue();
			var lname = this.byId("ll").getValue();
			if (em === "" || pass === "" || fname === "" || lname === "") {
				MessageToast.show("All feilds are mandatory");
			} else {
				var that=this;
				$.post("/destinations/Blackbird_01/admin_signup.xsjs", {
					email:em,
					password:pass,
					user_name:fname
				}).done(function(data) {
					if(data==='0'){
					var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
					oRouter.navTo("login");
					MessageToast.show("signup successful");
					}
					else{
						MessageToast.show("email aldready taken");
					}
				});
			}
		}
	});

});