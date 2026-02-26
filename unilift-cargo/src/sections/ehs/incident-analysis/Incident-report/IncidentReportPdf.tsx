'use client';

import React from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';
import ASSETS from '@/assets';
import {
  EmployeeInterviewsType,
  EntityDetailsType,
  EquipmentsType,
  FiveWhysAnalysisJsonType,
  FlowchartJsonType,
  TeamMemberBasicType,
  TeamMemberType
} from '@/types/ehs.types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: '/fonts/Inter-Regular.ttf'
    }
  ]
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 20,
    position: 'relative',
    fontFamily: 'Inter'
  },
  section: {
    margin: 0,
    padding: 0
  },
  header: {
    backgroundColor: '#FF914D', // primary color
    padding: '20px 30px',
    color: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 3 // Higher z-index to stay above watermark
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 10,
    opacity: 0.9
  },
  headerDate: {
    fontSize: 10,
    textAlign: 'right'
  },
  container: {
    padding: '25px 0px',
    position: 'relative',
    zIndex: 1 // Higher than watermark, lower than header/footer
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF914D', // primary color
    marginBottom: 15,
    marginTop: 10
  },
  fieldGroup: {
    backgroundColor: '#F9FAFB', // gray-50
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
    breakInside: 'avoid', // Prevent field groups from breaking across pages
    position: 'relative',
    zIndex: 1 // Ensure content appears above watermark
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  fieldLabel: {
    fontSize: 10,
    color: '#6B7280', // gray-500
    marginBottom: 2,
    fontWeight: 'medium'
  },
  fieldValue: {
    fontSize: 11,
    marginBottom: 5
  },
  fullWidth: {
    width: '100%'
  },
  separator: {
    borderBottom: '1px solid #E5E7EB',
    marginVertical: 20
  },
  table: {
    display: 'flex',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 4,
    breakInside: 'avoid', // Prevent tables from breaking across pages
    backgroundColor: 'rgba(255,255,255,0.9)' // Semi-transparent background
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid'
  },
  tableHeader: {
    backgroundColor: '#F9FAFB'
  },
  tableCell: {
    fontSize: 10,
    padding: 8,
    flex: 1
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'medium',
    textTransform: 'uppercase',
    color: '#6B7280'
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // Set to 0 to be behind content
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Prevents watermark from intercepting clicks
    backgroundColor: 'transparent' // Transparent background
  },
  watermarkImage: {
    width: '75%', // Adjust size as needed
    transform: 'rotate(-45deg)'
  },

  footer: {
    backgroundColor: '#FF914D',
    color: '#FFFFFF',
    // padding: '15px 30px',
    fontSize: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3, // Higher z-index to stay above watermark
    fontFamily: 'Inter'
  },
  pageNumber: {
    width: '250px',
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#FFFFFF'
  },
  personBox: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 4,
    marginBottom: 10,
    breakInside: 'avoid', // Prevent person boxes from breaking across pages
    position: 'relative',
    zIndex: 1 // Ensure content appears above watermark
  },
  personGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  personItem: {
    width: '25%',
    paddingRight: 10
  },
  whiteSpacePreWrap: {
    whiteSpace: 'pre-wrap'
  },
  pageBreak: {
    breakAfter: 'page' // Force a page break after this element
  }
});
// Incident Report PDF Document
const IncidentReportPdf = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisWithImageType;
}) => {
  const fiveWhyAnalysis =
    incidentDetails.viva_analysis as FiveWhysAnalysisJsonType;
  const flowchart = incidentDetails.flowchart_points as FlowchartJsonType[];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark} fixed>
          <Image
            src={ASSETS.IMG.SAFEZY_TEXT.src}
            style={styles.watermarkImage}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>
                Incident Investigation Report
              </Text>
              <Text style={styles.headerSubtitle}>
                Reference ID: IR-2025-014
              </Text>
            </View>
            <View>
              <Text style={styles.headerDate}>
                Created: {formatDate(incidentDetails.created_at)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            ...styles.container,
            paddingTop: 65
          }}
        >
          {/* Step 1: Basic Incident Information */}
          <View style={styles.section} wrap={true}>
            {/* wrap={false} ensures this section stays on one page */}
            <Text style={styles.sectionTitle}>Basic Incident Information</Text>
            <View style={styles.fieldGroup}>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Incident Title</Text>
                  <Text style={styles.fieldValue}>{incidentDetails.title}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Date & Time of Incident</Text>
                  <Text style={styles.fieldValue}>
                    {incidentDetails.date
                      ? formatDate(incidentDetails.date)
                      : '-'}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <Text style={styles.fieldValue}>
                    {incidentDetails.location}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Affected Entity</Text>
                  <Text style={styles.fieldValue}>
                    {((incidentDetails.affected_entity as string[]) ?? []).join(
                      ', '
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Narrative of Incident</Text>
              <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                {incidentDetails.narrative}
              </Text>
            </View>
            <Text style={styles.fieldLabel}>Investigation Team</Text>
            {(incidentDetails.investigation_team as TeamMemberBasicType[])?.map(
              member => (
                <View
                  key={member.email || member.name}
                  style={styles.personBox}
                  wrap={false}
                >
                  <View style={styles.personGrid}>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Investigator Name</Text>
                      <Text style={styles.fieldValue}>{member.name}</Text>
                    </View>
                    <View style={[styles.personItem, { width: '50%' }]}>
                      <Text style={styles.fieldLabel}>Email</Text>
                      <Text style={styles.fieldValue}>{member.email}</Text>
                    </View>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Contact</Text>
                      <Text style={styles.fieldValue}>{member.contact}</Text>
                    </View>
                  </View>
                </View>
              )
            )}
          </View>

          {/* Step 2: Affected Entity Information */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Affected Entity Information</Text>
            {(incidentDetails.entity_details as EntityDetailsType[])?.map(
              member => (
                <View
                  key={`${member.name}-${member.designation}`}
                  style={styles.personBox}
                  wrap={false}
                >
                  <View style={styles.personGrid}>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Entity Name</Text>
                      <Text style={styles.fieldValue}>{member.name}</Text>
                    </View>
                    <View style={[styles.personItem, { width: '50%' }]}>
                      <Text style={styles.fieldLabel}>Designation</Text>
                      <Text style={styles.fieldValue}>
                        {member.designation}
                      </Text>
                    </View>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Department</Text>
                      <Text style={styles.fieldValue}>{member.department}</Text>
                    </View>
                  </View>
                </View>
              )
            )}

            <View style={styles.fieldGroup}>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Shift Details</Text>
                  <Text style={styles.fieldValue}>
                    {incidentDetails.entity_shift_details} ({' '}
                    {incidentDetails.entity_shift_date})
                  </Text>
                </View>

                <View style={[styles.gridItem, styles.fullWidth]}>
                  <Text style={styles.fieldLabel}>Impact to Entity</Text>
                  <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                    {incidentDetails.cause_to_entity}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Step 3: Witness Details */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Witness Details</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primary Witness</Text>
              <Text style={styles.fieldValue}>
                {incidentDetails.witness_name} (
                {incidentDetails.witness_designation})
              </Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Recordings/Photos Available</Text>
              <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                {incidentDetails.witness_records}
              </Text>
            </View>
          </View>

          {/* Step 4: Pre-Incident Process/Operation Details */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              Pre-Incident Process Details
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Process Before Incident</Text>
              <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                {incidentDetails.process_before_incident}
              </Text>
            </View>

            <Text
              style={{
                ...styles.fieldValue,
                marginVertical: 10,
                fontWeight: 'medium'
              }}
            >
              Team Involved
            </Text>
            {(incidentDetails.team_involved as TeamMemberType[])?.map(
              member => (
                <View
                  key={member.email + member.name}
                  style={styles.personBox}
                  wrap={false}
                >
                  <View style={styles.personGrid}>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Team Member</Text>
                      <Text style={styles.fieldValue}>{member.name}</Text>
                    </View>
                    <View style={[styles.personItem, { width: '50%' }]}>
                      <Text style={styles.fieldLabel}>Email</Text>
                      <Text style={styles.fieldValue}>{member.email}</Text>
                    </View>
                    <View style={styles.personItem}>
                      <Text style={styles.fieldLabel}>Contact</Text>
                      <Text style={styles.fieldValue}>{member.contact}</Text>
                    </View>
                  </View>
                </View>
              )
            )}

            <Text
              style={{
                ...styles.fieldValue,
                marginVertical: 10,
                fontWeight: 'medium'
              }}
            >
              Equipment Assessment
            </Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                  Equipment Name
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                  Condition
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                  Availability
                </Text>
              </View>
              {(incidentDetails.tools_involved as EquipmentsType[])?.map(
                tool => (
                  <View key={tool.name} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{tool.name}</Text>
                    <Text style={styles.tableCell}>{tool.condition}</Text>
                    <Text style={styles.tableCell}>
                      {tool.is_ehs_checklist_completed}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Step 5: Historical Data */}
          {incidentDetails.is_a_past_incident &&
            incidentDetails.training_provided && (
              <View style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>Historical Data</Text>
                {incidentDetails.is_a_past_incident && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Past Incident History</Text>
                    <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                      {incidentDetails.past_incident_remarks}
                    </Text>
                  </View>
                )}
                {incidentDetails.training_provided && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Training Details</Text>
                    <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                      {incidentDetails.training_remarks}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* Step 6: Investigation Evidence */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Investigation Evidence</Text>
            {(
              incidentDetails.evidence_employee_list as EmployeeInterviewsType[]
            )?.map(evidence => (
              <View
                key={`${evidence.name}-${evidence.designation}`}
                style={[
                  styles.fieldGroup,
                  {
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white'
                  }
                ]}
              >
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>Employee Name</Text>
                    <Text style={styles.fieldValue}>{evidence.name}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.fieldLabel}>Designation</Text>
                    <Text style={styles.fieldValue}>
                      {evidence.designation}
                    </Text>
                  </View>
                  <View style={[styles.gridItem, styles.fullWidth]}>
                    <Text style={styles.fieldLabel}>Relation</Text>
                    <Text style={styles.fieldValue}>{evidence.relation}</Text>
                  </View>
                  <View style={[styles.gridItem, styles.fullWidth]}>
                    <Text style={styles.fieldLabel}>Statement</Text>
                    <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                      {evidence.comments}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pageBreak} />

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              Corrective & Preventives Actions
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Severity Level</Text>
              <Text style={[styles.fieldValue, styles.whiteSpacePreWrap]}>
                {incidentDetails.severity_level}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Corrective Actions</Text>
              <View>
                {(incidentDetails.corrective_actions as string[]).map(
                  action => (
                    <View
                      key={action}
                      style={{ flexDirection: 'row', marginBottom: 4 }}
                    >
                      <Text style={[styles.fieldValue, { marginRight: 8 }]}>
                        •
                      </Text>
                      <Text
                        style={[styles.fieldValue, styles.whiteSpacePreWrap]}
                      >
                        {action}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Preventive Actions</Text>
              <View>
                {(incidentDetails.preventive_actions as string[]).map(
                  action => (
                    <View
                      key={action}
                      style={{ flexDirection: 'row', marginBottom: 4 }}
                    >
                      <Text style={[styles.fieldValue, { marginRight: 8 }]}>
                        •
                      </Text>
                      <Text
                        style={[styles.fieldValue, styles.whiteSpacePreWrap]}
                      >
                        {action}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>5 WHYs Analysis</Text>
              <View>
                {fiveWhyAnalysis && fiveWhyAnalysis.points ? (
                  fiveWhyAnalysis.points.map((item, index) => (
                    <View
                      key={index}
                      style={{ flexDirection: 'row', marginBottom: 4 }}
                    >
                      <Text style={[styles.fieldValue, { marginRight: 8 }]}>
                        •
                      </Text>
                      <Text
                        style={[styles.fieldValue, styles.whiteSpacePreWrap]}
                      >
                        <Text style={{ fontWeight: 'bold' }}>Why? </Text>
                        {item.answer}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.fieldValue}>
                    No 5 WHYs analysis available for this incident
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Additional Comments</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldValue}>
                {incidentDetails.additional_comments}
              </Text>
            </View>
          </View>

          <View style={styles.pageBreak} />

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              Flowchart of events leading to the incident
            </Text>

            <View>
              {flowchart?.map((step, index) => (
                <View key={step.no} style={{ marginBottom: 15 }}>
                  <View
                    style={[
                      styles.fieldGroup,
                      {
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: 'white'
                      }
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#1F2937'
                      }}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}
                    >
                      {step.description}
                    </Text>
                  </View>

                  {index < flowchart.length - 1 && (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <Text
                        style={{
                          transform: 'rotate(90deg)',
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: '#FF914D'
                        }}
                      >
                        {'-->'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.pageBreak} />

          {incidentDetails.images && incidentDetails.images.length > 0 && (
            <View style={styles.section} break>
              <Text style={styles.sectionTitle}>Incident Photos</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                {incidentDetails.images.map((img, index) => (
                  <View
                    key={img.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      padding: '15px 0px'
                    }}
                    wrap={false}
                  >
                    <Image
                      src={img.image_url}
                      style={{
                        maxHeight: '1000px'
                      }}
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: '12px'
                      }}
                    >
                      Incident Image #{index + 1}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <View style={styles.footer} fixed>
          <Text>
            This is an official incident investigation report. Please maintain
            confidentiality.
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default IncidentReportPdf;
