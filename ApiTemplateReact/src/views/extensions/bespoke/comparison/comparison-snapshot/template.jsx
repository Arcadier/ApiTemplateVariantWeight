'use strict';

function template(tables) {
    return `<html>
                <head>
                    <title>comparison_pdf</title>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700&display=swap" rel="stylesheet" />
                    <style type="text/css">
                        .container {
                            max-width: 980px;
                            margin: 50px auto;
                            font-family: 'Roboto', sans-serif;
                        }
                        table {
                            border-spacing: 0;
                            border-collapse: collapse;
                            border: 1px solid;
                            margin-bottom: 30px;
                            page-break-inside: avoid;
                        }
                        table tr td {
                            border: 1px solid;
                            padding: 10px 15px;
                            font-size: 14px;
                            color: #000;
                        }
                        .price {
                            display: inline;
                            width: auto;
                            color: #52A345;
                        }
                        table tr td i {
                            color: #808080;
                        }
                        table tr td:first-child {
                            min-width: 100px;
                        }
                        @media print {
                            table {page-break-after:always;}
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${tables}
                    </div>
                </body>
            </html>`;
}

module.exports = template;