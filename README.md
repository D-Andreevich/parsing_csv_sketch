# It is only sketch

## Clone this repository

```bash
git clone https://github.com/D-Andreevich/parsing_csv_sketch.git
```

## Install dependencies

```bash
yarn
```

## Download data

Download https://github.com/datablist/sample-csv-files?tab=readme-ov-file any csv file

  or use default data in `data/customers-100.csv`

Set `filePath` in main.js

Set `mongoUri` in task.js


## Run

```bash
node main.js
```

### Metrics
>async approach  => Parsed by: 76504.971417 мс       | 1.2751 min    | 1k chunk  | 2M lines

>async approach  => Parsed by: 75408.95049999999 мс  | 1.2568 min    | 10k chunk | 2M lines

>treads approach => Parsed by: 67895.01912499999 мс  | 1.1316 min    | 10k chunk | 2M lines

>treads approach => Parsed by: 50237.112708 мс       | 50.327 sec    | 100k chunk| 2M lines
