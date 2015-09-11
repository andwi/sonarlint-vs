﻿/*
 * SonarLint for Visual Studio
 * Copyright (C) 2015 SonarSource
 * sonarqube@googlegroups.com
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
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using SonarLint.Common;
using SonarLint.Common.Sqale;
using SonarLint.Helpers;

namespace SonarLint.Rules
{
    [DiagnosticAnalyzer(LanguageNames.CSharp)]
    [SqaleConstantRemediation("5min")]
    [SqaleSubCharacteristic(SqaleSubCharacteristic.Understandability)]
    [Rule(DiagnosticId, RuleSeverity, Title, IsActivatedByDefault)]
    [Tags(Tag.Misra, Tag.Unused)]
    public class MethodParameterUnused : DiagnosticAnalyzer
    {
        internal const string DiagnosticId = "S1172";
        internal const string Title = "Unused method parameters should be removed";
        internal const string Description =
            "Unused parameters are misleading. Whatever the value passed to such parameters is, the behavior will be the same.";
        internal const string MessageFormat = "Remove this unused method parameter \"{0}\".";
        internal const string Category = "SonarQube";
        internal const Severity RuleSeverity = Severity.Major;
        internal const bool IsActivatedByDefault = true;
        private const IdeVisibility ideVisibility = IdeVisibility.Hidden;

        internal static readonly DiagnosticDescriptor Rule =
            new DiagnosticDescriptor(DiagnosticId, Title, MessageFormat, Category,
                RuleSeverity.ToDiagnosticSeverity(ideVisibility), IsActivatedByDefault,
                helpLinkUri: DiagnosticId.GetHelpLink(),
                description: Description,
                customTags: ideVisibility.ToCustomTags());

        public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get { return ImmutableArray.Create(Rule); } }

        public override void Initialize(AnalysisContext context)
        {
            context.RegisterCompilationStartAction(cs =>
            {
                var unusedParameters = ImmutableDictionary<IMethodSymbol, ImmutableArray<IParameterSymbol>>.Empty;
                var referencedMethods = ImmutableHashSet<IMethodSymbol>.Empty;

                cs.RegisterCodeBlockStartAction<SyntaxKind>(cbs =>
                {
                    var methodDeclaration = cbs.CodeBlock as MethodDeclarationSyntax;
                    var methodSymbol = cbs.OwningSymbol as IMethodSymbol;
                    if (methodDeclaration == null ||
                        methodSymbol == null ||
                        !IsMethodCandidate(methodSymbol))
                    {
                        return;
                    }

                    var usedParameters = ImmutableHashSet<IParameterSymbol>.Empty;

                    cbs.RegisterSyntaxNodeAction(sn =>
                    {
                        var identifier = (IdentifierNameSyntax)sn.Node;
                        var parameter = sn.SemanticModel.GetSymbolInfo(identifier).Symbol as IParameterSymbol;
                        if (parameter != null &&
                            methodSymbol.Parameters.Contains(parameter))
                        {
                            usedParameters = usedParameters.Add(parameter);
                        }
                    },
                    SyntaxKind.IdentifierName);

                    cbs.RegisterCodeBlockEndAction(cb =>
                    {
                        var unused = methodSymbol.Parameters.Except(usedParameters).ToImmutableArray();
                        if (unused.Length > 0)
                        {
                            unusedParameters = unusedParameters.Add(methodSymbol, unused);
                        }
                    });
                });

                cs.RegisterSyntaxNodeAction(sn =>
                {
                    var identifier = (IdentifierNameSyntax)sn.Node;
                    if (identifier.Parent is InvocationExpressionSyntax)
                    {
                        return;
                    }

                    var methodSymbol = sn.SemanticModel.GetSymbolInfo(identifier).Symbol as IMethodSymbol;
                    if (methodSymbol != null)
                    {
                        referencedMethods = referencedMethods.Add(methodSymbol);
                    }
                },
                SyntaxKind.IdentifierName);

                cs.RegisterCompilationEndAction(c =>
                {
                    foreach (var methodSymbol in unusedParameters.Keys.Except(referencedMethods))
                    {
                        foreach (var unusedParameter in unusedParameters[methodSymbol])
                        {
                            var reference = unusedParameter.DeclaringSyntaxReferences.FirstOrDefault();
                            if (reference == null)
                            {
                                continue;
                            }

                            var parameter = reference.GetSyntax() as ParameterSyntax;
                            if (parameter == null)
                            {
                                continue;
                            }

                            var location = parameter.Identifier.GetLocation();
                            c.ReportDiagnosticIfNonGenerated(Diagnostic.Create(Rule, location, unusedParameter.Name));
                        }
                    }
                });
            });
        }

        private static bool IsMethodCandidate(IMethodSymbol methodSymbol)
        {
            if (methodSymbol.IsAbstract ||
                methodSymbol.IsVirtual ||
                methodSymbol.IsOverride)
            {
                return false;
            }

            return !methodSymbol.ContainingType
                .AllInterfaces
                .SelectMany(@interface => @interface.GetMembers().OfType<IMethodSymbol>())
                .Any(method => methodSymbol.Equals(methodSymbol.ContainingType.FindImplementationForInterfaceMember(method)));
        }
    }
}
