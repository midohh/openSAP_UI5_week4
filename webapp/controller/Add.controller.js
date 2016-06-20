sap.ui.define([	"opensap/manageproducts/controller/BaseController",	"sap/ui/core/routing/History",	"sap/m/MessageToast",	"sap/ui/model/json/JSONModel"], function(BaseController, History, MessageToast, JSONModel) {	"use strict";	return BaseController.extend("opensap.manageproducts.controller.Add", {		/* =========================================================== */		/* lifecycle methods                                           */		/* =========================================================== */		/**		 * Called when the add controller is instantiated.		 * @public		 */		onInit: function() {						// Model used to manipulate control states. The chosen values make sure,			// detail page is busy indication immediately so there is no break in			// between the busy indication for loading the view's meta data			var iOriginalBusyDelay,				oViewModel = new JSONModel({					busy: true,					delay: 0				});							// Store original busy indicator delay, so it can be restored later on			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();			this.setModel(oViewModel, "addView");			this.getOwnerComponent().getModel().metadataLoaded().then(function() {				// Restore original busy indicator delay for the object view				oViewModel.setProperty("/delay", iOriginalBusyDelay);			});									// Register to the add route matched			this.getRouter().getRoute("add").attachPatternMatched(this._onRouteMatched, this);					},		/* =========================================================== */		/* event handlers                                              */		/* =========================================================== */		_onRouteMatched: function() {			var oViewModel = this.getModel("addView");			oViewModel.setProperty("/busy", true);			// register for metadata loaded events			var oModel = this.getModel();						//1.LOAD METADATA from ODATA-Service			//metadataLoaded.then = PROMISE			oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));						oViewModel.setProperty("/busy", false);		},				_onMetadataLoaded: function () {						// create default properties			var oProperties = {				ProductID: "" + parseInt(Math.random() * 1000000000, 10),				TypeCode: "PR",				TaxTarifCode: 1,				CurrencyCode: "EUR",				MeasureUnit: "EA"			};						//2.CREATE ENTRY in ODATA-Model			// create new entry in the model			this._oContext = this.getModel().createEntry("/ProductSet", {				properties: oProperties,				success: this._onCreateSuccess.bind(this)  //Callback function 			});						//3.BIND Context to View (Model <-> View is connected (Don´t forget "TwoWayBinding" in manifest.json!!)			// bind the view to the new entry			this.getView().setBindingContext(this._oContext);						},				_onCreateSuccess: function (oProduct) {			// navigate to the new product's object view			var sId = oProduct.ProductID;			this.getRouter().navTo("object", {				objectId : sId			}, true);							// unbind the view to not show this object again			this.getView().unbindObject();						// show success messge			var sMessage = this.getResourceBundle().getText("newObjectCreated", [oProduct.Name]);			MessageToast.show(sMessage, {				closeOnBrowserNavigation : false			});		},		/**		 * Event handler for the cancel action		 * @public		 */		onCancel: function() {			this.onNavBack();		},		/**		 * Event handler for the save action		 * @public		 */		onSave: function() {						var oViewModel = this.getModel("addView");			oViewModel.setProperty("/busy", true);						//4. SUBMIT changes in new entry to ODATA Service (Backend)			this.getModel().submitChanges();									oViewModel.setProperty("/busy", false);		},						/**		 * Event handler for navigating back.		 * It checks if there is a history entry. If yes, history.go(-1) will happen.		 * If not, it will replace the current entry of the browser history with the worklist route.		 * @public		 */		onNavBack : function() {			// discard new product from model.			this.getModel().deleteCreatedEntry(this._oContext);			var oHistory = History.getInstance(),				sPreviousHash = oHistory.getPreviousHash();			if (sPreviousHash !== undefined) {				// The history contains a previous entry				history.go(-1);			} else {				// Otherwise we go backwards with a forward history				var bReplace = true;				this.getRouter().navTo("worklist", {}, bReplace);			}		}	});});