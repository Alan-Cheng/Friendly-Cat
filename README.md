# FriendlyTime - 做個友善超人

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.13.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

打包在docs，給github-page存取的靜態資源 

`ng build --configuration=production --base-href /friendly-time/ --output-path=docs --aot`

打包在dist/專案名稱

`ng build --configuration=production --aot`
