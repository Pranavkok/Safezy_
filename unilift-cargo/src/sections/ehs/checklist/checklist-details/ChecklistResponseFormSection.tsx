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
  ChecklistProgressType,
  ChecklistResponseByContractorType,
  ChecklistTopicAndQuestionsType
} from '@/types/ehs.types';
import { Input } from '@/components/ui/input';
import {
  addChecklistResponseByContractor,
  sendChecklistCompleteEmail,
  updateChecklistResponseByContractor
} from '@/actions/contractor/checklist';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ASSETS from '@/assets';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';
import { SecondaryLogo } from '@/components/svgs';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formSchema } from '@/validations/admin/add-checklist';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
const ProgressDashboard = dynamic(() => import('@/components/ProgressChart'), {
  ssr: false, // Ensures it only runs on the client
  loading: () => <p>Loading Chart...</p> // Optional loading fallback
});

const ChecklistResponseFormSection = ({
  checklistQuestions,
  checklistProgress
}: {
  checklistQuestions: ChecklistTopicAndQuestionsType;
  checklistProgress: ChecklistProgressType;
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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!user?.userId) {
        toast.error('User ID is required');
        return;
      }

      let response;
      if (checklistProgress) {
        response = await updateChecklistResponseByContractor(
          data,
          user.userId,
          checklistProgress,
          hasAnsweredQuestionWeightage.totalYesAnswered
        );
      } else {
        response = await addChecklistResponseByContractor(
          data,
          user.userId,
          hasAnsweredQuestionWeightage.totalYesAnswered
        );
      }

      const res = await sendChecklistCompleteEmail(
        data.email,
        {
          answers: data.answers,
          topicName: checklistQuestions.topic_name,
          email: data.email,
          date: data.date,
          inspected_by: data.inspected_by,
          site_name: data.site_name
        },
        `${user.firstName + ' ' + user.lastName}`
      );

      if (response.success && res.success) {
        toast.success(res.message);
        reset();
        router.push(AppRoutes.EHS_CHECKLIST_LISTING);
      } else {
        toast.error(response.message);
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

          <div className=" absolute -right-[19rem] max-w-72 top-0 ">
            {checklistQuestions.image_url && (
              <Image
                src={checklistQuestions?.image_url}
                alt={checklistQuestions.topic_name}
                width={900}
                height={900}
                className="w-96"
              />
            )}
          </div>
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
          </CardHeader>

          <CardContent className="p-2 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Site Information Section */}
              <Card className="border border-primary shadow-sm">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Site Information
                  </h3>
                </CardHeader>
                <CardContent>
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
                      {...register('date')}
                    />
                  </div>
                </CardContent>
              </Card>

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
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end justify-end">
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

        <div className="my-5">
          {checklistProgress && (
            <ProgressDashboard
              checklistProgress={checklistProgress}
              totalWeightage={totalWeightage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistResponseFormSection;
