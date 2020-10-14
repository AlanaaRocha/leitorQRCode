import { Component, ChangeDetectorRef } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { HistoricoService } from '../servicos/historico.service';
import { Historico } from '../models/historico';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public leitorQRCode: any;

  public content: HTMLElement;
  public imglogo: HTMLElement;
  public footer: HTMLElement;
  public leitura: string;
  public Link = false;

  constructor(
    private qrScanner: QRScanner,
    public alertController: AlertController,
    public platform: Platform,
    private screenOrientation: ScreenOrientation,
    private cdRef: ChangeDetectorRef,
    private historicoService: HistoricoService
    ) {

      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

      this.platform.backButton.subscribeWithPriority(0, () => {
      this.content.style.opacity = '1';
      this.imglogo.style.opacity = '1';
      this.footer.style.opacity = '1';

      this.leitura = null;
      this.Link = false;

      this.qrScanner.hide();
      this.leitorQRCode.unsubscribe();

      });

    }

  public async lerQRCode() {
   this.qrScanner.prepare()
   .then((status: QRScannerStatus) => {
    if (status.authorized) {

this.content = document.getElementsByTagName('ion-content')[0] as HTMLElement;
this.imglogo = document.getElementById('logo') as HTMLElement;
this.footer = document.getElementById('footer') as HTMLElement;

this.content.style.opacity = '0';
this.imglogo.style.opacity = '0';
this.footer.style.opacity = '0';

this.qrScanner.show();

      this.leitorQRCode = this.qrScanner.scan().subscribe(async (text: string) => {
        this.leitura = (text['result']) ? text['result'] : text;
        
        this.content.style.opacity = '1';
        this.imglogo.style.opacity = '1';
        this.footer.style.opacity = '1';

        this.qrScanner.hide();
        this.leitorQRCode.unsubscribe();

        //this.presentAlert('LEITURA', this.leitura);
        this.verificaLink(this.leitura);
        this.cdRef.detectChanges();

        const historico = new Historico();
        historico.leitura = this.leitura;
        historico.dataHora = new Date();

        await this.historicoService.create(historico).then(resposta => {
          console.log(resposta);

        }).catch(erro => {
this.presentAlert('ERRO', 'Erro ao salvar no firebase');
console.log('ERRO:', erro);
        });

        
      });

    } else if (status.denied) {

    }else {

    }
   })
   .catch((e:any) => console.log('Error is', e));
  }

  async presentAlert(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
      
  });
  await alert.present();
}

public verificaLink(texto: string){

  const inicio = texto.substring(0, 4);

  if(inicio == 'www.' || inicio == "http"){
this.Link = true;
  }else {
    this.Link = false;
  }
}
}
