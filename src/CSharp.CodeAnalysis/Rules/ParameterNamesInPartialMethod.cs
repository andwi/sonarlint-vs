﻿/*
 * SonarQube C# Code Analysis
 * Copyright (C) 2015 SonarSource
 * dev@sonar.codehaus.org
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
 
using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using SonarQube.CSharp.CodeAnalysis.Helpers;
using SonarQube.CSharp.CodeAnalysis.SonarQube.Settings;
using SonarQube.CSharp.CodeAnalysis.SonarQube.Settings.Sqale;

namespace SonarQube.CSharp.CodeAnalysis.Rules
{
    [DiagnosticAnalyzer(LanguageNames.CSharp)]
    [SqaleConstantRemediation("10min")]
    [SqaleSubCharacteristic(SqaleSubCharacteristic.LogicReliability)]
    [Rule(DiagnosticId, RuleSeverity, Description, IsActivatedByDefault)]
    [Tags("cert", "misra", "pitfall")]
    public class ParameterNamesInPartialMethod : DiagnosticAnalyzer
    {
        internal const string DiagnosticId = "S927";
        internal const string Description = "\"partial\" method parameter names should match";
        internal const string MessageFormat = "Rename parameter \"{0}\" to \"{1}\".";
        internal const string Category = "SonarQube";
        internal const Severity RuleSeverity = Severity.Critical;
        internal const bool IsActivatedByDefault = true;

        internal static DiagnosticDescriptor Rule = 
            new DiagnosticDescriptor(DiagnosticId, Description, MessageFormat, Category, 
                RuleSeverity.ToDiagnosticSeverity(), IsActivatedByDefault, 
                helpLinkUri: "http://nemo.sonarqube.org/coding_rules#rule_key=csharpsquid%3AS927");

        public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get { return ImmutableArray.Create(Rule); } }

        public override void Initialize(AnalysisContext context)
        {
            context.RegisterSyntaxNodeAction(
                c =>
                {
                    var methodSyntax = (MethodDeclarationSyntax)c.Node;
                    var methodSymbol = c.SemanticModel.GetDeclaredSymbol(methodSyntax);

                    if (methodSymbol == null ||
                        methodSymbol.PartialDefinitionPart == null)
                    {
                        return;
                    }

                    var implementationParameters = methodSyntax.ParameterList.Parameters;
                    var definitionParameters = methodSymbol.PartialDefinitionPart.Parameters;

                    for (var i = 0; i < implementationParameters.Count; i++)
                    {
                        var implementationParameter = implementationParameters[i];
                        if (definitionParameters.Length > i)
                        {
                            var definitionParameter = definitionParameters[i];
                            if ((string) implementationParameter.Identifier.Value != definitionParameter.Name)
                            {
                                c.ReportDiagnostic(Diagnostic.Create(Rule, implementationParameter.Identifier.GetLocation(),
                                    implementationParameter.Identifier.Value, definitionParameter.Name));
                            }
                        }
                    }
                },
                SyntaxKind.MethodDeclaration);
        }
    }
}
