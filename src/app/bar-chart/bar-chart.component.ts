import { Component, ElementRef, ViewChild, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  @ViewChild('chart')
  private chartContainer: ElementRef;
  data: any[];
  minRange = 0;
  maxRange = 0;

  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.data = [];
  }

  ngOnInit() {
    setInterval(() => {
      this.generatePoint();
    }, 5000);
    // this.generatePoint();
  }
  generatePoint() {

    this.http.get('http://localhost:3000/data').subscribe((r: any) => {
      console.log(r);
      this.data.push(r.data);
    }, e => {
      console.log(e);
    });
    this.createChart();
    this.cdr.markForCheck();
  }
  // ngOnChanges(): void {
  //   console.log(this.data)
  //   if (!this.data) { return; }

  // }

  private createChart(): void {
    d3.select('svg').remove();

    const element = this.chartContainer.nativeElement;
    const datap = this.data;
    const data = datap.filter((r) => {
      if (r.age > this.minRange && r.age < this.maxRange) {
        return r;
      }
    });
    const svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(d3.zoom().on('zoom', () => {
        svg.attr('transform', d3.event.transform);
      }));
    const contentWidth = element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight = element.offsetHeight - this.margin.top - this.margin.bottom;

    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(data.map(d => d.age));

    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, d => d.salary)]);

    const g = svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(10, '%'))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 100)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'middle')
      .text('Salary');

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.age))
      .attr('y', d => y(d.salary))
      .attr('width', x.bandwidth())
      .attr('height', d => contentHeight - y(Number(d.salary)));
  }
}
