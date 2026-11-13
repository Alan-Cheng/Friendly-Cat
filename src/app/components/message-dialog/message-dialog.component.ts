import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  title: string;
  message: string;
  imgPath: string;
  closeMessage: string;

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // 接收傳遞的數據
  ) {
    this.dialogRef.addPanelClass('world-message-panel');
    // 設置傳遞的訊息
    this.title = data.title || "提示";
    this.message = data.message || '請稍後再試';
    this.imgPath = data.imgPath || '';
    this.closeMessage = data.closeMessage || '關閉';
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
