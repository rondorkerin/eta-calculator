class ExitOutcomeDistribution extends React.Component {
  render() {
    const exitDistribution = [
      { category: "0x (Loss)", probability: 31 },
      { category: "1-2x ROI", probability: 27 },
      { category: "2-5x ROI", probability: 36 },
      { category: "5-10x ROI", probability: 25 },
      { category: ">10x ROI", probability: 11 },
    ];

    return (
      <div
        style={{
          marginLeft: "20px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          fontFamily: "Arial, sans-serif",
          flex: "1",
        }}
      >
        <h3 style={{ color: "#2c3e50", textAlign: "center" }}>
          Exit Outcome Distribution
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "16px",
            textAlign: "left",
            border: "1px solid #ccc",
          }}
        >
          <thead style={{ backgroundColor: "#f3f3f3" }}>
            <tr>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  fontWeight: "bold",
                }}
              >
                Exit Category
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  fontWeight: "bold",
                }}
              >
                Probability (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {exitDistribution.map((outcome, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  {outcome.category}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  {outcome.probability}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class InvestmentCalculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startYear: 2025,
      income: 200000,
      investmentPercentage: 30,
      incomeGrowthRate: 10,
      capitalGainsTax: 20,
      results: [],
    };
  }

  calculateReturns = () => {
    const { startYear, income, investmentPercentage, incomeGrowthRate, capitalGainsTax } = this.state;
    const horizon = 20;
    const exitDistribution = [31, 27, 36, 25, 11];
    const multipliers = [0, 1.5, 3.5, 7.5, 12];
    const investmentPool = [];
    let results = [];
    let annualIncome = income;
    let totalPortfolio = 0;

    for (let year = startYear; year < startYear + horizon; year++) {
      const annualInvestment = annualIncome * (investmentPercentage / 100);
      investmentPool.push({ year, amount: annualInvestment });
      let exits = [];
      let failures = [];
      let reinvestedExits = 0;

      investmentPool.forEach((investment, index) => {
        const age = year - investment.year;
        if (age >= 5 && age <= 10) {
          const exitCategory = this.getExitCategory(exitDistribution);
          const multiplier = multipliers[exitCategory];
          if (multiplier > 0) {
            const postTaxExit =
              investment.amount * multiplier * (1 - capitalGainsTax / 100);
            const irr = this.calculateIRR(investment.amount, postTaxExit, age);
            exits.push({
              fromYear: investment.year,
              amount: postTaxExit,
              multiple: multiplier,
              irr: irr.toFixed(2),
            });
            reinvestedExits += postTaxExit;
          } else {
            failures.push(investment.year);
          }
          investmentPool.splice(index, 1);
        }
      });

      totalPortfolio += annualInvestment + reinvestedExits;

      results.push({
        year,
        annualIncome: this.formatCurrency(annualIncome),
        wageGrowth: this.formatCurrency(annualIncome * incomeGrowthRate / 100),
        annualInvestment: this.formatCurrency(annualInvestment),
        reinvestedExits: this.formatCurrency(reinvestedExits),
        totalPortfolio: this.formatCurrency(totalPortfolio),
        exits,
        failures,
        exitCount: exits.length,
      });

      annualIncome *= 1 + incomeGrowthRate / 100;
    }

    this.setState({ results });
  };

  getExitCategory = (distribution) => {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (let i = 0; i < distribution.length; i++) {
      cumulative += distribution[i];
      if (random <= cumulative) return i;
    }
    return distribution.length - 1;
  };

  calculateIRR = (initial, exit, years) => {
    return ((exit / initial) ** (1 / years) - 1) * 100;
  };

  formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: parseFloat(value) || 0 });
  };

  render() {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <h1 style={{ textAlign: "center", color: "#2c3e50" }}>ETA Investment Calculator</h1>
        <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#34495e" }}>
            Welcome to the <strong>Search Fund Investment Calculator</strong>, a tool designed to help investors explore potential returns from search fund investments.
          </p>
        </div>
        <div style={{ display: "flex", width: "100%" }}>
          {/* Input Section */}
          <div style={{ flex: "2", marginRight: "20px" }}>
            <label style={{ marginBottom: "10px", display: "block" }}>
              Initial After-Tax Income ($):
              <input
                type="number"
                name="income"
                value={this.state.income}
                onChange={this.handleInputChange}
                style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
              />
            </label>
            <label style={{ marginBottom: "10px", display: "block" }}>
              Annual % of Income Invested (%):
              <input
                type="number"
                name="investmentPercentage"
                value={this.state.investmentPercentage}
                onChange={this.handleInputChange}
                style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
              />
            </label>
            <label style={{ marginBottom: "10px", display: "block" }}>
              Income Growth Rate (%):
              <input
                type="number"
                name="incomeGrowthRate"
                value={this.state.incomeGrowthRate}
                onChange={this.handleInputChange}
                style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
              />
            </label>
            <button
              onClick={this.calculateReturns}
              style={{
                marginTop: "20px",
                padding: "10px",
                backgroundColor: "#2c3e50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Calculate
            </button>
          </div>
          {/* Exit Outcome Distribution */}
          <ExitOutcomeDistribution />
        </div>
        {/* Results Section */}
        {this.state.results.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", fontSize: "18px", border: "1px solid #ccc" }}>
            <thead style={{ backgroundColor: "#f3f3f3" }}>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Year</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Annual Income</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Wage Growth</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Invested This Year</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Reinvested Exits</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold", backgroundColor: "#e6f7ff" }}>
                  Total Portfolio $
                </th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Exits</th>
                <th style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>Failures</th>
              </tr>
            </thead>
            <tbody>
              {this.state.results.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.year}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.annualIncome}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.wageGrowth}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.annualInvestment}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.reinvestedExits}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "#e6f7ff" }}>{result.totalPortfolio}</td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                    {result.exits.map((exit, i) => (
                      <div key={i}>
                        From {exit.fromYear}, Multiple: {exit.multiple}x, IRR: {exit.irr}%
                      </div>
                    ))}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "10px" }}>{result.failures.join(", ") || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

React.render(<InvestmentCalculator />, document.querySelector("#app"));

