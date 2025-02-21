# attr2json

An utility library for extracting JSON data from HTML attributes.

## Motivation

When using setups where you are mostly rendering static HTML pages on the server, you often want to pass some sort of data to your JavaScript,
which is often either done via an API endpoint or somehow dumping JSON into the DOM. Both of these approaches are quite cumbersome which is what
this library tries to solve:

Lets see this example where we'll create a solution to render [chart.js](https://www.chartjs.org/) charts using HTML attributes:

```html
<!-- this site is using daisyui -->
<div class="card bg-base-200 my-4">
    <div class="card-body">
        <h2 class="card-title">
            Pie Chart
        </h2>

        <canvas
            chartjs <!-- this is used as a marker to init the thing later you could use something else though like an id -->
            chartjs:type="pie"
            chartjs:data.labels[0]="40%"
            chartjs:data.labels[1]="60%"
            chartjs:data.datasets[0].data[0]="40"
            chartjs:data.datasets[0].backgroundColor[0]="red"
            chartjs:data.datasets[0].data[1]="60"
            chartjs:data.datasets[0].backgroundColor[1]="blue"
        ></canvas>
    </div>
</div>

<!-- this is the JS we use to initialize chartjs -->
<script type="module">
    import { Chart } from "chart.js";
    import { extractJson } from "attr2json";

    // for every element that has the marker we defined here "chartjs"
    document.querySelectorAll("[chartjs]").forEach(elem => {
        const data = extractJson(elem, "chartjs");

        /*
         * Representation of what "data" is right now:
         *
         * {
         *     type: "pie",
         *     data: {
         *         labels: ["40%", "60%"],
         *         datasets: [{
         *             data: [40, 60],
         *             backgroundColor: ["red", "blue"],
         *         }
         *     }
         * }
         */

        // init chart.js
        new Chart(elem, data);
    });
</script>
```

## Syntax

The syntax of attr2json parse syntax contains always a prefix, a colon, a path and a value

for example

```html
<div prefix:path="value"></div>
````

this is equivalent with

```json
{
    "path": "value"
}
```

The prefix can generally be whatever you want it to be just make sure its unique and doesn't collide with other things.

The **path** however is a bit special, here are a few example on how it might be parsed:

- prefix:path -> key is path
- prefix:very.nested.path -> This will create a JSON object like this: ``{ very: nested: path: ... }``
- prefix:numbers[3] -> This will create an array, the index gets used to determine the order of the element inside the array, e.g. prefix:numbers[3]="5" will create [5] and not [undefined, undefined, 5]
- prefix:start-at-zero -> since it's common to use camel case in JS names and HTML attributes are case insensitive, we parse kebab case into camel case e.g. prefix:start-at-zero becomes startAtZero

The **value** also has some special parsing rules:

- if it can be parsed as a number it will be e.g. "1337" becomes 1337, "13.37" becomes 13.37
- if it is "true" or "false" (or "TRUE", "FALSE") it will be parsed as a boolean
- if none of the above rules match it will be a string

## License

MIT
