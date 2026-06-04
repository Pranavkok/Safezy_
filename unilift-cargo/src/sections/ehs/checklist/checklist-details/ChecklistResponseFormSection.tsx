'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import {
  ChecklistResponseByContractorType,
  ChecklistTopicAndQuestionsType
} from '@/types/ehs.types';
import { Input } from '@/components/ui/input';
import {
  addChecklistResponseByContractor,
  sendChecklistCompleteEmail
} from '@/actions/contractor/checklist';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ASSETS from '@/assets';
import { AppRoutes } from '@/constants/AppRoutes';
import { STATIC_CHECKLIST_HEADER_FIELDS } from '@/constants/constants';
import { useRouter } from 'next/navigation';
import { SecondaryLogo } from '@/components/svgs';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formSchema } from '@/validations/admin/add-checklist';
import { CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import ChecklistPdfDocument from '@/data/ChecklistPdfDocument';

const ChecklistResponseFormSection = ({
  checklistQuestions
}: {
  checklistQuestions: ChecklistTopicAndQuestionsType;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm<ChecklistResponseByContractorType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicId: checklistQuestions?.id || 0,
      date: new Date().toISOString().split('T')[0],
      header_values: STATIC_CHECKLIST_HEADER_FIELDS.map(f => ({
        label: f.label,
        value: ''
      })),
      answers: checklistQuestions.ehs_checklist_questions.map(q => ({
        questionId: q.id,
        answer: undefined,
        remark: '',
        weightage: Number(q.weightage)
      }))
    }
  });

  const user = useUser();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');

  const answers = watch('answers') || [];

  const totalWeightage = answers.reduce((prevSum, question) => {
    if (question.answer === 'N/A') {
      return prevSum;
    }
    return prevSum + Number(question.weightage);
  }, 0);

  const hasAnsweredQuestionWeightage = answers.reduce(
    (prevSum, answer) => {
      if (answer.answer === 'Yes') {
        return {
          totalYesAnswered: prevSum.totalYesAnswered + Number(answer.weightage),
          totalAttendQuestion: prevSum.totalAttendQuestion + 1
        };
      } else if (answer.answer !== undefined) {
        return {
          totalYesAnswered: prevSum.totalYesAnswered,
          totalAttendQuestion: prevSum.totalAttendQuestion + 1
        };
      }
      return prevSum;
    },
    { totalYesAnswered: 0, totalAttendQuestion: 0 }
  );

  const progress =
    (hasAnsweredQuestionWeightage.totalAttendQuestion * 100) /
    checklistQuestions.ehs_checklist_questions.length;

  const onSubmit = async (data: ChecklistResponseByContractorType) => {
    try {
      setIsSubmitting(true);

      const answered = data.answers.filter(q => q.answer);
      if (answered.length === 0) {
        toast.error('Please answer at least one question.');
        setIsSubmitting(false);
        return;
      }

      const response = await addChecklistResponseByContractor(
        data,
        hasAnsweredQuestionWeightage.totalYesAnswered
      );

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      let pdfBase64: string | undefined;
      try {
        const pdfData = {
          topicName: checklistQuestions.topic_name,
          siteName: data.site_name,
          inspectedBy: data.inspected_by,
          date: data.date,
          headerValues: data.header_values ?? [],
          answers: data.answers
            .filter(a => a.answer)
            .map(a => ({
              question: a.questionText ?? '',
              answer: a.answer ?? '',
              remark: a.remark ?? '',
              weightage: Number(a.weightage)
            }))
        };
        const blob = await pdf(<ChecklistPdfDocument data={pdfData} />).toBlob();
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (pdfErr) {
        console.error('Client-side PDF generation failed:', pdfErr);
      }

      const res = await sendChecklistCompleteEmail(
        data.email,
        {
          answers: data.answers,
          topicName: checklistQuestions.topic_name,
          email: data.email,
          date: data.date,
          inspected_by: data.inspected_by,
          site_name: data.site_name,
          header_values: data.header_values ?? []
        },
        `${user.firstName + ' ' + user.lastName}`,
        ccEmails.filter(e => e.trim() !== ''),
        pdfBase64
      );

      if (res.success) {
        toast.success(res.message);
        reset();
        router.push(AppRoutes.EHS_CHECKLIST_LISTING);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Error submitting checklist:', error);
      toast.error('Failed to submit checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completion stats
  const answeredQuestions = answers.filter(answer => answer?.answer).length;

  return (
    <div className="relative">
      <div className="relative w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Progress Floating Card */}
        <div className="sticky top-[70px] z-20 mb-4 sm:mb-6">
          <Card className="bg-white shadow-lg border border-primary overflow-hidden ">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-6  " />
              <div className="bg-primary py-2 px-4 md:p-3 text-white flex flex-row md:flex-col justify-between items-center w-full md:w-52">
                <div>
                  <h3 className="font-bold text-sm md:text-base mb-0">
                    Total Weightage
                  </h3>
                </div>
                <div className="text-2xl md:text-3xl font-bold">
                  {hasAnsweredQuestionWeightage.totalYesAnswered} /{' '}
                  {totalWeightage}
                </div>
              </div>

              <div className="flex-1 p-3 w-full">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm text-gray-700">
                    Completion Progress
                  </h3>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <Progress value={progress} />
                </div>

                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span>{answeredQuestions} questions completed</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
        <div className=" absolute w-full h-full pointer-events-none">
          <div className="absolute -left-96 top-10 rotate-90">
            <Image
              src={ASSETS.IMG.SAFEZY_TEXT}
              alt="Safety Text"
              height={512}
              width={512}
              className="w-[450px] h-auto"
              priority
            />
          </div>
        </div>
        <Card className="border border-primary rounded">
          <CardHeader className="rounded-t p-2 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-300  pb-2 sm:pb-4 gap-3 sm:gap-0">
              <SecondaryLogo className="bg-primary pt-3 rounded sm:w-40 md:w-48" />
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center sm:text-right">
                EHS Checklist
              </div>
            </div>

            {/* Topic Name */}
            <div className="w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl font-extrabold py-2 sm:py-3 mt-2 sm:mt-4 rounded-md px-2">
              {checklistQuestions.topic_name.toUpperCase()}
            </div>

            {/* Site Information — inside header */}
            <div className="mt-4 border border-primary rounded-md overflow-hidden">
              <div className="bg-primary px-4 py-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Site Information</h3>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputFieldWithLabel
                    type="text"
                    label="Name of Site"
                    errorText={errors.site_name?.message}
                    required
                    {...register('site_name')}
                  />
                  <InputFieldWithLabel
                    type="text"
                    label="Inspected By"
                    errorText={errors.inspected_by?.message}
                    required
                    {...register('inspected_by')}
                  />
                  <InputFieldWithLabel
                    type="date"
                    label="Date of Inspection"
                    errorText={errors.date?.message}
                    required
                    min={yesterday}
                    max={today}
                    {...register('date')}
                  />
                </div>
              </div>
            </div>

            {/* Equipment Details */}
            <div className="mt-4 border border-primary rounded-md overflow-hidden">
              <div className="bg-primary px-4 py-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Equipment Details</h3>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {STATIC_CHECKLIST_HEADER_FIELDS.map((field, index) =>
                    field.options ? (
                      <div key={index} className="col-span-1 sm:col-span-2 border-b border-primary/20 pb-3">
                        <span className="font-semibold text-primary text-sm block mb-2">
                          {field.label}:
                        </span>
                        <Controller
                          name={`header_values.${index}.value`}
                          control={control}
                          render={({ field: f }) => (
                            <div className="flex flex-wrap gap-2">
                              {field.options!.map(option => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => f.onChange(option)}
                                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                                    f.value === option
                                      ? 'bg-primary text-white border-primary'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    ) : (
                      <div key={index} className="flex items-center gap-3 border-b border-primary/20 pb-2">
                        <span className="font-semibold text-primary whitespace-nowrap text-sm min-w-fit">
                          {field.label}:
                        </span>
                        <Input
                          {...register(`header_values.${index}.value`)}
                          className="flex-1 border-0 shadow-none bg-transparent focus-visible:ring-0 px-0 text-sm"
                          placeholder="Enter value..."
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Reference Image */}
            {checklistQuestions.image_url && (
              <div className="mt-4">
                <Image
                  src={checklistQuestions.image_url}
                  alt={checklistQuestions.topic_name}
                  width={1200}
                  height={600}
                  className="w-full max-h-72 object-cover rounded-md border border-gray-200"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-2 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Questions Section */}
              <div className="space-y-4">
                {checklistQuestions.ehs_checklist_questions.map(
                  (question, index) => {
                    return (
                      <Card
                        key={question.id}
                        className={`border border-primary`}
                      >
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                              <h4 className="font-medium text-gray-800 ">
                                <span className="inline-flex items-center justify-center bg-primary text-white rounded-full w-6 h-6 text-sm mr-2">
                                  {index + 1}
                                </span>
                                {question.question}
                              </h4>
                              <p className="text-sm bg-primary bg-opacity-10 text-white px-3 py-1 rounded-full font-medium">
                                Weightage: {question.weightage}
                              </p>
                            </div>

                            {/* Hidden fields */}
                            <Input
                              value={question.id}
                              {...register(`answers.${index}.questionId`)}
                              className="hidden"
                            />
                            <Input
                              value={question.question}
                              {...register(`answers.${index}.questionText`)}
                              className="hidden"
                            />
                            <Input
                              value={question.weightage}
                              {...register(`answers.${index}.weightage`)}
                              className="hidden"
                            />

                            {/* Answer Options */}
                            <div className=" bg-opacity-70 rounded-lg">
                              <Controller
                                name={`answers.${index}.answer`}
                                control={control}
                                render={({ field }) => (
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0"
                                  >
                                    {[
                                      {
                                        value: 'Yes',
                                        label: 'Yes',
                                        color: 'bg-green-500'
                                      },
                                      {
                                        value: 'No',
                                        label: 'No',
                                        color: 'bg-red-500'
                                      },
                                      {
                                        value: 'N/A',
                                        label: 'N/A',
                                        color: 'bg-blue-500'
                                      }
                                    ].map(option => (
                                      <div
                                        key={option.value}
                                        className="flex items-center"
                                      >
                                        <div className="relative flex items-center space-x-2">
                                          <RadioGroupItem
                                            value={option.value}
                                            id={`${option.value.toLowerCase()}-${question.id}`}
                                            className="peer"
                                          />
                                          <Label
                                            htmlFor={`${option.value.toLowerCase()}-${question.id}`}
                                            className="cursor-pointer py-2 px-5 rounded-full border peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:border-primary transition-colors"
                                          >
                                            {option.label}
                                          </Label>
                                        </div>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                              {errors?.answers?.[index]?.answer && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {errors.answers[index].answer?.message}
                                </p>
                              )}
                            </div>

                            {/* Remarks */}
                            <TextAreaWithLabel
                              label="Remarks"
                              id={`remark-${question.id}`}
                              {...register(`answers.${index}.remark`)}
                              placeholder="Add any additional comments or observations..."
                              className="w-full"
                              rows={3}
                              errorText={
                                errors?.answers?.[index]?.remark
                                  ?.message as string
                              }
                              removeBottomPadding
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>

              {/* Submit Section */}
              <Card className="border border-primary">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                    <div className="flex-1">
                      <Input
                        {...register('email')}
                        className="w-full sm:w-80"
                        placeholder="Enter Senior email"
                      />
                      {errors?.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CC Emails */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-1 block">CC (Optional)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ccEmails.map((email, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded-md"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => setCcEmails(prev => prev.filter((_, i) => i !== index))}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={ccInput}
                        onChange={e => setCcInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = ccInput.trim();
                            if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !ccEmails.includes(trimmed)) {
                              setCcEmails(prev => [...prev, trimmed]);
                              setCcInput('');
                            }
                          }
                        }}
                        className="w-full sm:w-80"
                        placeholder="Enter CC email and press Enter"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => {
                          const trimmed = ccInput.trim();
                          if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !ccEmails.includes(trimmed)) {
                            setCcEmails(prev => [...prev, trimmed]);
                            setCcInput('');
                          }
                        }}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="px-8 h-10 whitespace-nowrap"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ChecklistResponseFormSection;
