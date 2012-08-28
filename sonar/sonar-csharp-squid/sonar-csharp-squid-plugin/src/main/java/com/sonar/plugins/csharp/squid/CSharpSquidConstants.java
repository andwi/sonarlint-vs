/*
 * Sonar C# Plugin :: C# Squid :: Sonar Plugin
 * Copyright (C) 2010 Jose Chillan, Alexandre Victoor and SonarSource
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
package com.sonar.plugins.csharp.squid;

public final class CSharpSquidConstants {

  private CSharpSquidConstants() {
  }

  public static final String REPOSITORY_KEY = "csharpsquid";
  public static final String REPOSITORY_NAME = "Sonar";

  public static final String CPD_MINIMUM_TOKENS_PROPERTY = "sonar.cpd.cs.minimumTokens";
  public static final String CPD_IGNORE_LITERALS_PROPERTY = "sonar.cpd.cs.ignoreLiteral";
  public static final boolean CPD_IGNORE_LITERALS_DEFVALUE = true;
  public static final String IGNORE_HEADER_COMMENTS = "sonar.cs.ignoreHeaderComments";

}
