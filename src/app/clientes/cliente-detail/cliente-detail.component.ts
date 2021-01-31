import { HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ICustomEvent } from '@shared/model/custom-event.model';
import { ModalService } from '@shared/service/modal.service';
import { SwalService } from '@shared/service/swal.service';
import { ClienteModel } from '../cliente.model';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-cliente-detail',
  templateUrl: './cliente-detail.component.html',
  styleUrls: ['./cliente-detail.component.css'],
})
export class ClienteDetailComponent implements OnInit {
  @Input() public cliente: ClienteModel;
  public isLoading = false;
  public progress = 0;
  private thumbnail: File;

  constructor(
    title: Title,
    private clienteService: ClienteService,
    private swalService: SwalService,
    public modalService: ModalService
  ) {
    title.setTitle('Detalle del cliente');
  }

  ngOnInit() {}

  public selectedPhoto(event: ICustomEvent) {
    this.thumbnail = event.target.files[0];
    this.progress = 0;
    if (this.thumbnail.type.indexOf('image') < 0) {
      this.swalService.error(
        'Error',
        'Solo se admiten imagenes con extensión .jpeg, .jpg y .png.'
      );
      this.thumbnail = null;
    }
  }

  public upload() {
    if (!this.thumbnail) {
      this.swalService.warning(
        'Seleccionar foto',
        'Debe seleccionar una foto.'
      );
    } else {
      this.isLoading = true;
      this.clienteService.upload(this.thumbnail, this.cliente.id).subscribe(
        (event) => {
          this.isLoading = false;
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            const response: any = event.body;
            this.cliente = response.cliente as ClienteModel;
            this.swalService.success(
              'Foto',
              'La foto del cliente se ha subido con éxito.'
            );
          }
        },
        (err) => {
          this.isLoading = false;
          console.error(err);
          this.swalService.error('Ocurrio un error', err.error.message);
        }
      );
    }
  }

  public closeModal() {
    this.modalService.closeModal();
    this.thumbnail = null;
    this.progress = 0;
  }
}
