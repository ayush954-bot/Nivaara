import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calculator, IndianRupee, Percent, Calendar } from "lucide-react";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000); // ₹50 Lakhs
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenure, setTenure] = useState(20); // 20 years

  // Calculate EMI using formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return emi;
  };

  const emi = calculateEMI();
  const totalAmount = emi * tenure * 12;
  const totalInterest = totalAmount - loanAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLakhs = (amount: number) => {
    const lakhs = amount / 100000;
    return lakhs.toFixed(2) + "L";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            EMI Calculator
          </h2>
          <p className="text-lg text-muted-foreground">
            Calculate your monthly home loan payments
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Loan Amount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    Loan Amount
                  </Label>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(loanAmount)}
                  </div>
                </div>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(value) => setLoanAmount(value[0])}
                  min={500000}
                  max={50000000}
                  step={100000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹5L</span>
                  <span>₹5Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    Interest Rate (p.a.)
                  </Label>
                  <div className="text-lg font-bold text-primary">
                    {interestRate.toFixed(2)}%
                  </div>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={6}
                  max={15}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Loan Tenure
                  </Label>
                  <div className="text-lg font-bold text-primary">
                    {tenure} Years
                  </div>
                </div>
                <Slider
                  value={[tenure]}
                  onValueChange={(value) => setTenure(value[0])}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 Years</span>
                  <span>30 Years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Monthly EMI */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-8 text-center">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Monthly EMI
                </div>
                <div className="text-5xl font-bold mb-2">
                  {formatCurrency(emi)}
                </div>
                <div className="text-sm opacity-75">
                  for {tenure} years
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">Principal Amount</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-bold text-lg text-amber-600">
                    {formatCurrency(totalInterest)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <span className="font-semibold">Total Amount Payable</span>
                  <span className="font-bold text-xl text-primary">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Visual Breakdown */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Principal</span>
                    <span className="font-semibold">
                      {((loanAmount / totalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary"
                      style={{
                        width: `${(loanAmount / totalAmount) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-500"
                      style={{
                        width: `${(totalInterest / totalAmount) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interest</span>
                    <span className="font-semibold">
                      {((totalInterest / totalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Principal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span>Interest</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This calculator provides an estimate only. Actual EMI may vary based on bank policies, processing fees, and other charges. Please consult with our financial advisors for accurate calculations.
          </p>
        </div>
      </div>
    </section>
  );
}
