import { Component, OnInit } from '@angular/core';
import { ProxyTokenService } from './services/proxy-token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'friendly-time';

  constructor(private readonly proxyTokenService: ProxyTokenService) {}

  ngOnInit(): void {
    void this.proxyTokenService.start();
  }
}
