﻿// Copyright © 2011 - Present RealDimensions Software, LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// 
// You may obtain a copy of the License at
// 
// 	http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

namespace chocolatey.infrastructure.services
{
    public interface IXmlService
    {
        /// <summary>
        ///   Deserializes the specified XML file path.
        /// </summary>
        /// <typeparam name="XmlType">The type of the ml type.</typeparam>
        /// <param name="xmlFilePath">The XML file path.</param>
        /// <returns></returns>
        XmlType deserialize<XmlType>(string xmlFilePath);

        /// <summary>
        ///   Serializes the specified XML type.
        /// </summary>
        /// <typeparam name="XmlType">The type of the ml type.</typeparam>
        /// <param name="xmlType">Type of the XML.</param>
        /// <param name="xmlFilePath">The XML file path.</param>
        void serialize<XmlType>(XmlType xmlType, string xmlFilePath);
    }
}