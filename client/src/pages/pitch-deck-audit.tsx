import { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, FileText, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PitchDeckAuditResult } from "@shared/schema";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import logoPath from "@assets/logo blackleo_1759773901852.png";

export default function PitchDeckAudit() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<PitchDeckAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setError(null);
      setAuditResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a pitch deck file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pitchDeck', selectedFile);

      const response = await fetch('/api/pitch-deck-audit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze pitch deck');
      }

      setAuditResult(data.result);
      toast({
        title: "Analysis Complete",
        description: "Your pitch deck has been analyzed successfully",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Analysis Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investment_ready':
        return 'bg-green-500';
      case 'promising':
        return 'bg-yellow-500';
      case 'not_ready':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'investment_ready':
        return 'Investment Ready';
      case 'promising':
        return 'Promising, Needs Refinement';
      case 'not_ready':
        return 'Not Ready';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'investment_ready':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'promising':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'not_ready':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/">
            <img 
              src={logoPath} 
              alt="Black Leo Ventures" 
              className="h-16 cursor-pointer" 
              data-testid="logo-header"
            />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">AI-Powered Pitch Deck Audit</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant, professional feedback on your pitch deck using advanced AI analysis. 
              Upload your deck and receive a comprehensive investment scorecard.
            </p>
          </div>

          {!auditResult && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Upload Your Pitch Deck</CardTitle>
                <CardDescription>
                  Supported formats: PDF, PPT, PPTX (Max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
                  <input
                    type="file"
                    id="pitchDeck"
                    accept=".pdf,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                  <label 
                    htmlFor="pitchDeck" 
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    {selectedFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium" data-testid="text-selected-file">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Click to upload or drag and drop your pitch deck
                      </p>
                    )}
                  </label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription data-testid="text-error-message">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                  data-testid="button-analyze-deck"
                >
                  {isAnalyzing ? (
                    <>Analyzing Your Deck...</>
                  ) : (
                    <>AI Analyze Deck</>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      Analyzing your pitch deck with AI...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {auditResult && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Overall Assessment</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAuditResult(null);
                        setSelectedFile(null);
                        setError(null);
                      }}
                      data-testid="button-analyze-another"
                    >
                      Analyze Another Deck
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-lg border">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(auditResult.status)}
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-2xl font-bold" data-testid="text-status-label">
                          {getStatusLabel(auditResult.status)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Score</p>
                      <p className="text-5xl font-bold" data-testid="text-total-score">
                        {auditResult.totalScore}
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                    <p className="text-muted-foreground" data-testid="text-summary-report">
                      {auditResult.summaryReport}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Scorecard</CardTitle>
                  <CardDescription>Detailed breakdown of your pitch deck evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {auditResult.criteriaScores.map((criteria, index) => (
                      <div key={index} className="space-y-2" data-testid={`scorecard-item-${index}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium" data-testid={`text-criteria-name-${index}`}>
                            {criteria.name}
                          </h4>
                          <Badge variant="outline" data-testid={`badge-score-${index}`}>
                            {criteria.score}/10
                          </Badge>
                        </div>
                        <Progress value={criteria.score * 10} className="h-2" />
                        <p className="text-sm text-muted-foreground" data-testid={`text-criteria-feedback-${index}`}>
                          {criteria.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggested Questions for the Founder</CardTitle>
                  <CardDescription>
                    Key questions investors might ask based on your pitch deck
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {auditResult.suggestedQuestions.map((question, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-lg hover-elevate"
                        data-testid={`question-item-${index}`}
                      >
                        <span className="font-semibold text-primary mt-0.5">
                          {index + 1}.
                        </span>
                        <span data-testid={`text-question-${index}`}>{question}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Want to improve your pitch deck and increase your score?
                </p>
                <Button asChild size="lg" data-testid="button-contact-us">
                  <a 
                    href="https://wa.me/917837059633?text=Hi%2C%20I%20just%20completed%20my%20pitch%20deck%20audit%20and%20would%20like%20help%20improving%20it." 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Contact Our Team
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
