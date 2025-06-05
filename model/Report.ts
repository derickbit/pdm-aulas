export class Report {
  constructor(
    public id: string,
    public uid: string,
    public assunto: string,
    public texto: string,
    public urlFoto: string
  ) {
    this.uid = uid;
    this.assunto = assunto;
    this.texto = texto;
    this.urlFoto = urlFoto;
    this.id = id;
  }
}
