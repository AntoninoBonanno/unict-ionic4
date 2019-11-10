import { Component } from '@angular/core';

import { BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

import { ToastService } from 'src/app/shared/toast.service';
import { ToastTypes } from 'src/app/enums/toast-types.enum';

@Component({
  selector: 'app-extra',
  templateUrl: './extra.page.html',
  styleUrls: ['./extra.page.scss'],
})
export class ExtraPage {

  barcodeData = {} as BarcodeScanResult;

  geoPosition = {} as Geoposition;
  geoPolling;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private vibration: Vibration,
    private geolocation: Geolocation,
    private toastService: ToastService
  ) { }

  vibrate() {
    this.vibration.vibrate(1000);
  }

  async openQRScanner() {

    try {

      this.barcodeData = await this.barcodeScanner.scan();

    } catch (err) {

      this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

  }

  async getPosition() {

    try {

      this.geoPosition = await this.geolocation.getCurrentPosition();

    } catch (err) {

      this.toastService.show({
        message: err.message,
        type: ToastTypes.ERROR
      });

    }

  }

}
