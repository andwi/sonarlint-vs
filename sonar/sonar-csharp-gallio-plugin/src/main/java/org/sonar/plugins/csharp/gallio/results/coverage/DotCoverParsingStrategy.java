/*
 * Sonar C# Plugin :: Gallio
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
package org.sonar.plugins.csharp.gallio.results.coverage;

import static org.sonar.plugins.csharp.gallio.helper.StaxHelper.findAttributeValue;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import javax.xml.stream.XMLStreamException;

import org.codehaus.staxmate.in.SMInputCursor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonar.api.batch.SensorContext;
import org.sonar.api.resources.Project;
import org.sonar.api.utils.SonarException;
import org.sonar.dotnet.tools.commons.visualstudio.VisualStudioSolution;
import org.sonar.plugins.csharp.gallio.results.coverage.model.CoveragePoint;
import org.sonar.plugins.csharp.gallio.results.coverage.model.FileCoverage;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;

public class DotCoverParsingStrategy implements CoverageResultParsingStrategy {

  private static final Logger LOG = LoggerFactory.getLogger(DotCoverParsingStrategy.class);
  
  private Map<Integer, File> fileRegistry;
  private Multimap<Integer, CoveragePoint> coveragePointRegistry;

  public boolean isCompatible(SMInputCursor rootCursor) {
    String version = findAttributeValue(rootCursor, "DotCoverVersion");
    final boolean result;
    if (version == null) {
      result = false;
    } else {
      LOG.info("dotCover version {} format detected", version);
      result = true;
    }
    return result;
  }

  public List<FileCoverage> parse(SensorContext ctx, VisualStudioSolution solution, Project sonarProject, SMInputCursor cursor) {
    fileRegistry = Maps.newHashMap();
    coveragePointRegistry = ArrayListMultimap.create();
    try {
      cursor = cursor.childElementCursor();
      while (cursor.getNext() != null) {
        if ("File".equals(cursor.getQName().getLocalPart())) {
          parseFileBloc(cursor);
        } else if ("Assembly".equals(cursor.getQName().getLocalPart())) {
          parseAndSearchMemberBloc(cursor);
        }
      }
    } catch (XMLStreamException e) {
      throw new SonarException(e);
    }
    
    List<FileCoverage> result = Lists.newArrayList();
    for (int fileIndex : coveragePointRegistry.keySet()) {
      File sourceFile = fileRegistry.get(fileIndex);
      FileCoverage fileCoverage = new FileCoverage(sourceFile);
      Collection<CoveragePoint> points = coveragePointRegistry.get(fileIndex);
      for (CoveragePoint point : points) {
        fileCoverage.addPoint(point);
      }
      result.add(fileCoverage);
    }
  
    return result;
  }
  
  private void parseFileBloc(SMInputCursor cursor) throws XMLStreamException {
    int fileIndex = Integer.valueOf(cursor.getAttrValue("Index"));
    try {
      File sourceFile = new File(cursor.getAttrValue("Name")).getCanonicalFile();
      fileRegistry.put(fileIndex, sourceFile);
    } catch (IOException e) {
      throw new SonarException("Sourcefile referenced in dotCover report not found", e);
    }
    
  }

  private void parseAndSearchMemberBloc(SMInputCursor cursor) throws XMLStreamException {
    if ("Member".equals(cursor.getLocalName())) {
      parseMemberBloc(cursor);
    } else {
      SMInputCursor childCursor = cursor.childElementCursor();
      while (childCursor.getNext() != null) {
        parseAndSearchMemberBloc(childCursor);
      }
    }
  }
  
  private void parseMemberBloc(SMInputCursor memberCursor) throws XMLStreamException {
      SMInputCursor statementCursor = memberCursor.childElementCursor();
      while (statementCursor.getNext() != null) {
        int startLine = Integer.valueOf(statementCursor.getAttrValue("Line"));
        int endLine = Integer.valueOf(statementCursor.getAttrValue("EndLine"));
        final int visits;
        if ("True".equals(statementCursor.getAttrValue("Covered"))) {
          visits = 1; // we cannot know the exact number of visit with dotcover
        } else {
          visits = 0;
        }
        CoveragePoint point = new CoveragePoint();
        point.setCountVisits(visits);
        point.setStartLine(startLine);
        point.setEndLine(endLine);
        
        int fileIndex = Integer.valueOf(statementCursor.getAttrValue("FileIndex"));
        coveragePointRegistry.put(fileIndex, point);
         
      }
  }

}
